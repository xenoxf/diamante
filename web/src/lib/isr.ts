/**
 * Helper ISR (Incremental Static Regeneration) para Astro con adapter Node.
 *
 * Decisión 8 del usuario: usar ISR.
 * - Las páginas con `export const prerender = true` se generan en build (SSG).
 * - Con `output: 'server'`, las rutas dinámicas NO prerenderizadas
 *   (o nuevos slugs creados en Strapi tras el build) se renderizan
 *   bajo demanda y se cachean según estas cabeceras.
 * - `s-maxage` + `stale-while-revalidate` = comportamiento ISR:
 *   sirve cache fresco X seg, luego revalida en background.
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

/** Aplica cabeceras ISR a la respuesta actual (llamar en frontmatter Astro). */
export function setISRHeaders(
  response: Response,
  opts: ISROptions = {},
): void {
  try {
    response.headers.set('Cache-Control', isrCacheControl(opts));
    response.headers.set('CDN-Cache-Control', isrCacheControl(opts));
  } catch {
    // response puede ser inmutable en prerender: ignorar
  }
}
