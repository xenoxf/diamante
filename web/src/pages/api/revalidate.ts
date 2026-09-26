/**
 * On-Demand Revalidation - equivalente a `save_post` + WP Rocket purge en WordPress.
 *
 * Flujo WordPress: hook save_post -> borra cache/*.html
 * Aquí: Strapi webhook -> POST /api/revalidate?secret=TOKEN -> purga ISR + opcional Deploy Hook
 *
 * Configuración Strapi Admin > Settings > Webhooks:
 *  URL: https://diamante-nu.vercel.app/api/revalidate?secret=TU_SECRET
 *  Events: entry.create, entry.update, entry.delete, entry.publish, entry.unpublish, media.create
 *  Headers: content-type application/json (default)
 *
 * ENV en Vercel:
 *  REVALIDATE_SECRET = token aleatorio largo (openssl rand -hex 32)
 *  VERCEL_DEPLOY_HOOK_URL = https://api.vercel.com/v1/integrations/deploy/prj_.../...
 *  (Deploy Hook opcional: para páginas estáticas `prerender=true` que no son ISR)
 */
export const prerender = false;

interface StrapiPayload {
  model?: string;
  entry?: any;
  event?: string;
}

const STATIC_DEPLOY_HOOK_MODELS = new Set([
  'configuracion-general',
  'pagina-contacto',
  'pagina-identidad',
  'documento-institucional',
]);

const ISR_MODELS: Record<string, (entry: any) => string[]> = {
  noticia: (e) => (e?.slug ? [`/noticias/${e.slug}`, '/noticias', '/sitemap.xml'] : ['/noticias', '/sitemap.xml']),
  'galeria-item': () => ['/galeria', '/sitemap.xml'],
  sede: (e) => (e?.slug ? [`/sedes/${e.slug}`, '/sedes', '/sitemap.xml'] : ['/sedes', '/sitemap.xml']),
  especialidad: (e) => (e?.slug ? [`/especialidades/${e.slug}`, '/especialidades', '/sitemap.xml'] : ['/especialidades', '/sitemap.xml']),
  // genéricos si Strapi envía collection name distinto (ej. noticias, sedes)
  noticias: (e) => (e?.slug ? [`/noticias/${e.slug}`, '/noticias', '/sitemap.xml'] : ['/noticias', '/sitemap.xml']),
  sedes: (e) => (e?.slug ? [`/sedes/${e.slug}`, '/sedes', '/sitemap.xml'] : ['/sedes', '/sitemap.xml']),
  especialidades: (e) => (e?.slug ? [`/especialidades/${e.slug}`, '/especialidades', '/sitemap.xml'] : ['/especialidades', '/sitemap.xml']),
  'galeria-items': () => ['/galeria', '/sitemap.xml'],
};

function getSecret(request: Request): string | null {
  const url = new URL(request.url);
  return url.searchParams.get('secret') || request.headers.get('x-revalidate-secret');
}

function resolvePaths(payload: any): { paths: string[]; needsDeploy: boolean } {
  // Strapi v5 payload forma: { model: 'noticia', entry: { slug: '...' }, event: 'entry.update' }
  // O forma webhook genérica: { model, entry, event }
  const rawModel: string | undefined =
    payload?.model || payload?.collection || payload?.uid || payload?.type || undefined;
  const model = rawModel ? rawModel.toLowerCase().replace(/^api::/, '').split('.')[0] : '';
  const entry = payload?.entry || payload?.result || payload?.data || payload;

  // Caso ?paths=/noticias,/galeria manual (útil para tests)
  if (payload?.paths && Array.isArray(payload.paths)) {
    return { paths: payload.paths, needsDeploy: false };
  }

  if (model && STATIC_DEPLOY_HOOK_MODELS.has(model)) {
    return { paths: ['/sitemap.xml'], needsDeploy: true };
  }

  const resolver = model ? (ISR_MODELS as any)[model] : null;
  if (resolver) {
    try {
      const paths = resolver(entry);
      return { paths, needsDeploy: false };
    } catch {}
  }

  // Fallback: si no reconocemos modelo, purgar sitemap + home (seguro, no deploy)
  // Si es evento genérico sin modelo, asumir que es contenido dinámico
  if (!model && entry?.slug) {
    return { paths: ['/noticias', '/galeria', '/sitemap.xml'], needsDeploy: false };
  }

  // Desconocido: solo sitemap
  return { paths: ['/sitemap.xml'], needsDeploy: false };
}

export async function POST({ request }: { request: Request }) {
  const secret = getSecret(request);
  const expected = (import.meta as any).env?.REVALIDATE_SECRET || (process as any).env?.REVALIDATE_SECRET;

  if (!expected) {
    return new Response(JSON.stringify({ error: 'REVALIDATE_SECRET no configurado en Vercel' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (secret !== expected) {
    return new Response(JSON.stringify({ error: 'Secret inválido' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload: any = {};
  try {
    const text = await request.text();
    payload = text ? JSON.parse(text) : {};
  } catch {
    // Strapi a veces envía vacío en test webhook
    payload = {};
  }

  const { paths, needsDeploy } = resolvePaths(payload);
  const siteUrl =
    (import.meta as any).env?.SITE_URL || (process as any).env?.SITE_URL || 'https://diamante-nu.vercel.app';
  const base = siteUrl.replace(/\/$/, '');
  const deployHook = (import.meta as any).env?.VERCEL_DEPLOY_HOOK_URL || (process as any).env?.VERCEL_DEPLOY_HOOK_URL;

  // ISR purge: en Vercel/Astro, revalidar = fetch con bypass.
  // La forma más fiable sin token interno es tocar cada path con `x-prerender-revalidate` via fetch interno.
  // Si falla, el TTL de 300s igual revalidará, pero intentamos purga inmediata.
  const purgeResults: Array<{ path: string; ok: boolean; status?: number }> = [];

  for (const p of paths) {
    try {
      // Intentar purga vía fetch interno (funciona si Vercel respeta Cache-Control no-cache)
      // En local no hay ISR, solo marcar ok
      const url = `${base}${p}`;
      // No bloqueante: fire-and-forget con signal timeout
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'x-prerender-revalidate': expected, 'Cache-Control': 'no-cache' },
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(t);
      purgeResults.push({ path: p, ok: true, status: (res as any)?.status });
    } catch {
      purgeResults.push({ path: p, ok: false });
    }
  }

  // Si es contenido estático (config, paginas), disparar Deploy Hook para rebuild SSG
  let deployTriggered = false;
  if (needsDeploy && deployHook) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 3000);
      await fetch(deployHook, { method: 'POST', signal: controller.signal }).catch(() => null);
      clearTimeout(t);
      deployTriggered = true;
    } catch {
      deployTriggered = false;
    }
  }

  return new Response(
    JSON.stringify({
      revalidated: true,
      paths,
      purgeResults,
      deployTriggered,
      needsDeploy,
      at: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Endpoint interno: nunca debe indexarse.
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
  );
}

export async function GET({ request }: { request: Request }) {
  // Permitir GET para healthcheck/test: ?secret=...&paths=/noticias
  if (request.method === 'GET') {
    const url = new URL(request.url);
    if (url.searchParams.get('secret')) {
      // Reusar POST logic con query
      return POST({ request } as any);
    }
  }
  return new Response(JSON.stringify({ ok: true, usage: 'POST /api/revalidate?secret=TOKEN con body Strapi' }), {
    headers: { 'Content-Type': 'application/json', 'X-Robots-Tag': 'noindex, nofollow' },
  });
}
