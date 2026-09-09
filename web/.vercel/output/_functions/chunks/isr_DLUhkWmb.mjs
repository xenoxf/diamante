//#region src/lib/isr.ts
function isrCacheControl(opts = {}) {
	const { maxAge = 60, sMaxAge = 300, staleWhileRevalidate = 86400 } = opts;
	return `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`;
}
/** Aplica cabeceras ISR a la respuesta actual (llamar en frontmatter Astro). */
function setISRHeaders(response, opts = {}) {
	try {
		response.headers.set("Cache-Control", isrCacheControl(opts));
		response.headers.set("CDN-Cache-Control", isrCacheControl(opts));
	} catch {}
}
//#endregion
export { setISRHeaders as t };
