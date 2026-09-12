/**
 * Render de contenido rico que llega de Strapi.
 *
 * Strapi puede devolver el campo richtext en 3 formas:
 *  1. HTML (fallback local o richtext ya convertido) -> se devuelve tal cual.
 *  2. Markdown (editor Markdown de Strapi) -> se convierte a HTML.
 *  3. Blocks JSON de Strapi 5 (array de { type, children }) -> se convierte a HTML.
 *
 * `renderRichText()` detecta automáticamente y siempre devuelve HTML seguro
 * para usar con `set:html={...}`.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/`/g, '&#96;');
}

/** ¿Parece HTML ya? (contiene alguna etiqueta) */
export function isHtml(value: string): boolean {
  return /<[a-zA-Z][^>]*>/.test(value);
}

/** Inline markdown: code, imágenes, enlaces, bold, italic, strike */
function renderInline(src: string): string {
  // src ya viene escapado; reintroducimos etiquetas desde sintaxis markdown.
  let out = src;

  // code inline `x`
  out = out.replace(/`([^`\n]+?)`/g, (_m, code) => `<code>${code}</code>`);
  // imágenes ![alt](url)
  out = out.replace(
    /!\[([^\]]*?)\]\((\S+?)(?:\s+&quot;.*?&quot;)?\)/g,
    (_m, alt, url) => `<img src="${escapeAttr(url)}" alt="${alt}" loading="lazy" decoding="async" />`,
  );
  // enlaces [texto](url)
  out = out.replace(
    /\[([^\]]+?)\]\((\S+?)\)/g,
    (_m, text, url) => {
      const href = escapeAttr(url);
      const external = /^https?:\/\//i.test(url);
      const extra = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${href}"${extra}>${text}</a>`;
    },
  );
  // bold **texto** y __texto__
  out = out.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__([^_]+?)__/g, '<strong>$1</strong>');
  // strike ~~texto~~
  out = out.replace(/~~([^~]+?)~~/g, '<del>$1</del>');
  // italic *texto* y _texto_ (evitar romper listas: requiere contenido)
  out = out.replace(/(^|[^*\w])\*([^*\n]+?)\*(?=[^*\w]|$)/g, '$1<em>$2</em>');
  out = out.replace(/(^|[^\w])_([^_\n]+?)_(?=[^\w]|$)/g, '$1<em>$2</em>');
  return out;
}

function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const html: string[] = [];
  let para: string[] = [];
  let listStack: string[] = []; // 'ul' | 'ol'
  let inCode = false;
  let codeBuf: string[] = [];
  let inQuote: string[] | null = null;
  let inTableHead: string[] | null = null;
  let inTableBody: string[][] | null = null;

  const flushPara = () => {
    if (para.length > 0) {
      const text = para.join('<br />');
      html.push(`<p>${renderInline(text)}</p>`);
      para = [];
    }
  };
  const flushQuote = () => {
    if (inQuote && inQuote.length > 0) {
      html.push(`<blockquote>${inQuote.map((l) => `<p>${renderInline(l)}</p>`).join('')}</blockquote>`);
    }
    inQuote = null;
  };
  const flushTable = () => {
    if (inTableHead && inTableBody) {
      const thead = `<thead><tr>${inTableHead.map((c) => `<th>${renderInline(c.trim())}</th>`).join('')}</tr></thead>`;
      const tbody = `<tbody>${inTableBody.map((row) => `<tr>${row.map((c) => `<td>${renderInline(c.trim())}</td>`).join('')}</tr>`).join('')}</tbody>`;
      html.push(`<table>${thead}${tbody}</table>`);
    }
    inTableHead = null;
    inTableBody = null;
  };
  const closeLists = () => {
    while (listStack.length > 0) {
      html.push(`</${listStack.pop()}>`);
    }
  };

  const isTableSep = (line: string) => /^\|?[\s:|-]+\|?[\s:|.-]*$/.test(line.trim()) && line.includes('|');

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? '';
    const line = raw.replace(/\s+$/, '');

    // code fence ```
    if (/^```/.test(line.trim())) {
      if (inCode) {
        html.push(`<pre><code>${codeBuf.join('\n')}</code></pre>`);
        codeBuf = [];
        inCode = false;
      } else {
        flushPara();
        flushQuote();
        flushTable();
        closeLists();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(escapeHtml(raw));
      continue;
    }

    if (/^\s*$/.test(line)) {
      flushPara();
      flushQuote();
      flushTable();
      closeLists();
      continue;
    }

    // tabla: cabecera + separador
    if (line.includes('|')) {
      const next = (lines[i + 1] ?? '').trim();
      if (!inTableHead && isTableSep(next)) {
        flushPara();
        flushQuote();
        closeLists();
        inTableHead = line.trim().replace(/^\||\|$/g, '').split('|');
        inTableBody = [];
        i++; // saltar separador
        continue;
      }
      if (inTableHead && inTableBody) {
        inTableBody.push(line.trim().replace(/^\||\|$/g, '').split('|'));
        continue;
      }
    } else if (inTableHead) {
      flushTable();
    }

    // headings #..######
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushPara();
      flushQuote();
      flushTable();
      closeLists();
      const level = h[1]!.length;
      html.push(`<h${level}>${renderInline(escapeHtml(h[2]!.trim()))}</h${level}>`);
      continue;
    }

    // hr --- *** ___
    if (/^(\*\*\*|---|___)\s*$/.test(line.trim())) {
      flushPara();
      flushQuote();
      flushTable();
      closeLists();
      html.push('<hr />');
      continue;
    }

    // blockquote >
    const q = line.match(/^&gt;|^>/);
    // ojo: line ya escapado? No, aquí trabajamos con raw sin escapar para detectar.
    const qm = raw.match(/^\s*>\s?(.*)$/);
    if (qm) {
      flushPara();
      flushTable();
      closeLists();
      if (!inQuote) inQuote = [];
      inQuote.push(escapeHtml(qm[1] ?? ''));
      void q;
      continue;
    } else {
      flushQuote();
    }

    // listas - * +  y  1.
    const ulm = line.match(/^\s*[-*+]\s+(.*)$/);
    const olm = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ulm || olm) {
      flushPara();
      flushTable();
      const kind = ulm ? 'ul' : 'ol';
      const content = (ulm?.[1] ?? olm?.[1] ?? '').trim();
      // checkbox - [ ] / - [x]
      const check = content.match(/^\[([ xX])\]\s+(.*)$/);
      if (listStack[listStack.length - 1] !== kind) {
        closeLists();
        html.push(`<${kind}>`);
        listStack.push(kind);
      }
      if (check) {
        const checked = check[1]!.toLowerCase() === 'x' ? ' checked disabled' : ' disabled';
        html.push(`<li><input type="checkbox"${checked} /> ${renderInline(escapeHtml(check[2]!))}</li>`);
      } else {
        html.push(`<li>${renderInline(escapeHtml(content))}</li>`);
      }
      continue;
    } else {
      closeLists();
    }

    // párrafo normal (acumula saltos simples como <br />)
    para.push(escapeHtml(line.trim()));
  }

  flushPara();
  flushQuote();
  flushTable();
  closeLists();
  if (inCode && codeBuf.length > 0) {
    html.push(`<pre><code>${codeBuf.join('\n')}</code></pre>`);
  }
  return html.join('\n');
}

/** Renderiza un nodo inline de Blocks (Strapi 5) */
function renderBlockChildren(children: any[]): string {
  if (!Array.isArray(children)) return '';
  return children
    .map((ch: any) => {
      if (ch?.type === 'link' && ch.url) {
        const inner = renderBlockChildren(ch.children ?? [{ text: ch.text ?? '' }]);
        const external = /^https?:\/\//i.test(String(ch.url));
        const extra = external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${escapeAttr(String(ch.url))}"${extra}>${inner}</a>`;
      }
      let text = escapeHtml(String(ch?.text ?? ''));
      if (ch?.code) text = `<code>${text}</code>`;
      if (ch?.bold) text = `<strong>${text}</strong>`;
      if (ch?.italic) text = `<em>${text}</em>`;
      if (ch?.underline) text = `<u>${text}</u>`;
      if (ch?.strikethrough) text = `<del>${text}</del>`;
      return text;
    })
    .join('');
}

/** Blocks JSON de Strapi 5 -> HTML */
function blocksToHtml(blocks: any[]): string {
  const out: string[] = [];
  for (const b of blocks) {
    if (!b || typeof b !== 'object') continue;
    const type = (b as any).type as string;
    const children = renderBlockChildren((b as any).children ?? []);
    switch (type) {
      case 'paragraph':
        if (children.trim()) out.push(`<p>${children}</p>`);
        break;
      case 'heading': {
        const level = Math.min(6, Math.max(1, Number((b as any).level ?? 2)));
        out.push(`<h${level}>${children}</h${level}>`);
        break;
      }
      case 'quote':
        out.push(`<blockquote><p>${children}</p></blockquote>`);
        break;
      case 'code':
        out.push(`<pre><code>${children}</code></pre>`);
        break;
      case 'list': {
        const tag = (b as any).format === 'ordered' ? 'ol' : 'ul';
        const items = Array.isArray((b as any).children)
          ? (b as any).children.map((it: any) => `<li>${renderBlockChildren(it?.children ?? [])}</li>`).join('')
          : '';
        out.push(`<${tag}>${items}</${tag}>`);
        break;
      }
      case 'list-item':
        out.push(`<li>${children}</li>`);
        break;
      case 'image': {
        const img = (b as any).image;
        const url = img?.url ? escapeAttr(String(img.url)) : '';
        const alt = img?.alternativeText ? escapeAttr(String(img.alternativeText)) : '';
        if (url) out.push(`<p><img src="${url}" alt="${alt}" loading="lazy" decoding="async" /></p>`);
        break;
      }
      case 'link': {
        const url = (b as any).url ? escapeAttr(String((b as any).url)) : '#';
        out.push(`<p><a href="${url}">${children || url}</a></p>`);
        break;
      }
      default: {
        // Tipos desconocidos: si tiene texto, párrafo.
        if (children.trim()) out.push(`<p>${children}</p>`);
        break;
      }
    }
  }
  return out.join('\n');
}

function looksLikeBlocks(value: unknown): value is any[] {
  return Array.isArray(value) && value.every((b) => b && typeof b === 'object' && typeof (b as any).type === 'string');
}

/**
 * Punto de entrada: acepta string (HTML o Markdown) o Blocks JSON.
 * Siempre devuelve HTML listo para `set:html`.
 */
export function renderRichText(input: unknown): string {
  if (input === null || input === undefined) return '';
  if (looksLikeBlocks(input)) return blocksToHtml(input);
  if (Array.isArray(input)) {
    // Array no-blocks (p.ej. lista de valores): unir textos
    return input
      .map((x) => (typeof x === 'string' ? renderRichText(x) : ''))
      .filter(Boolean)
      .join('\n');
  }
  if (typeof input !== 'string') return '';
  const text = input.trim();
  if (!text) return '';
  // Objeto serializado como string?
  if ((text.startsWith('[{') || text.startsWith('[{"')) && text.endsWith(']')) {
    try {
      const parsed = JSON.parse(text);
      if (looksLikeBlocks(parsed)) return blocksToHtml(parsed);
    } catch {
      // no era JSON, seguir como texto
    }
  }
  if (isHtml(text)) return text;
  return markdownToHtml(text);
}

/** Resumen plano: quita HTML y sintaxis markdown. Útil para `resumen`. */
export function stripRichText(input: unknown): string {
  if (!input) return '';
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[([^\]]*)\]\(\S+?\)/g, '$1')
    .replace(/\[([^\]]+)\]\(\S+?\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(^|[^*\w])\*([^*\n]+?)\*/g, '$1$2')
    .replace(/~~([^~]+?)~~/g, '$1')
    .replace(/`([^`]+?)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^(\s*[-*+]\s+|\s*\d+[.)]\s+)/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}
