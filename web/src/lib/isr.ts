/**
 * Helper ISR (Incremental Static Regeneration) para Astro hybrid + Vercel.
 *
 * Con `output: 'hybrid'`:
 * - `prerender = true`  -> SSG en build, CDN eterno.
 * - `prerender = false` -> ISR: Vercel renderiza bajo demanda y cachea según
 *   `Cache-Control` / `CDN-Cache-Control` + `adapter.vercel.isr.expiration`.
 *
 * Uso: `setISRHeaders(Astro.response, { sMaxAge: 300 })` en frontmatter de páginas ISR.
 */

export interface ISROptions {
  /** Segundos en cache de navegador (default 60). */
  maxAge?: number;
  /** Segundos en CDN/server (default 300 = 5min). */
  sMaxAge?: number;
  /** Segundos sirviendo stale mientras revalida (default 86400 = 1 día). */
  staleWhileRevalidate?: number;
}

export function isrCacheControl(opts: ISROptions = {}): string {
  const { maxAge = 60, sMaxAge = 300, staleWhileRevalidate = 86400 } = opts;
  return `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`;
}

/** Aplica cabeceras ISR de forma segura (no lanza si response es inmutable en prerender). */
export function setISRHeaders(
  response: Response,
  opts: ISROptions = {},
): void {
  try {
    const value = isrCacheControl(opts);
    response.headers.set('Cache-Control', value);
    response.headers.set('CDN-Cache-Control', value);
  } catch {
    // prerender estático: response inmutable, ignorar
  }
}
