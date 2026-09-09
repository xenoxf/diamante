import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { C as createAstro, d as renderTemplate, f as maybeRenderHead, i as renderComponent, m as addAttribute } from "./server_Cw-A2kAj.mjs";
import { t as createComponent } from "./compiler_BI4hSaVN.mjs";
import { d as $$Header, f as $$Layout, l as readSource, m as getStrapiMediaUrl, n as $$Footer, t as $$PageHero } from "./page_JcrvOEkv.mjs";
import { t as $$DataSourceBadge } from "./DataSourceBadge_D8ujJDZl.mjs";
import { t as setISRHeaders } from "./isr_DLUhkWmb.mjs";
import { t as noticiasService } from "./noticias.service_BJUx29hU.mjs";
//#region src/pages/noticias/index.astro
var noticias_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://diamante-nu.vercel.app");
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	setISRHeaders(Astro.response, { sMaxAge: 180 });
	const rawPage = Astro.url.searchParams.get("page");
	let page = parseInt(rawPage ?? "1", 10);
	if (isNaN(page) || page < 1) page = 1;
	const pageSize = 6;
	let noticias = [];
	let pagination = null;
	try {
		const result = await noticiasService.getNoticiasPaginated({
			page,
			pageSize
		});
		noticias = result.data;
		pagination = result.pagination;
	} catch (err) {
		console.warn("[noticias/index] fallback paginado:", err);
		try {
			const todas = await noticiasService.getNoticias();
			const total = todas.length;
			const pageCount = Math.max(1, Math.ceil(total / pageSize));
			const safePage = Math.min(page, pageCount);
			const start = (safePage - 1) * pageSize;
			noticias = todas.slice(start, start + pageSize);
			pagination = {
				page: safePage,
				pageSize,
				pageCount,
				total
			};
			page = safePage;
		} catch {
			noticias = [];
			pagination = {
				page: 1,
				pageSize,
				pageCount: 1,
				total: 0
			};
		}
	}
	if (pagination && page > pagination.pageCount) page = pagination.pageCount;
	const source = readSource(noticias);
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Header", $$Header, {})}${maybeRenderHead($$result)}<main class="page">${renderComponent($$result, "PageHero", $$PageHero, {
		"kicker": "Actualidad",
		"title": "Noticias"
	})}<div class="container container--wide"><p class="lead">Información oficial sobre actividades académicas, culturales y administrativas de la Institución Educativa El Diamante.</p><div style="margin: 0 0 12px;">${renderComponent($$result, "DataSourceBadge", $$DataSourceBadge, { "source": source })}</div>${noticias.length === 0 ? renderTemplate`<p class="empty">No hay noticias disponibles en este momento.</p>` : renderTemplate`<div class="grid">${noticias.map((noticia) => {
		const portadaUrl = noticia.portadaUrl ?? getStrapiMediaUrl(noticia.portada) ?? null;
		return renderTemplate`<article class="card">${portadaUrl ? renderTemplate`<img${addAttribute(portadaUrl, "src")}${addAttribute(`Portada de ${noticia.titulo}`, "alt")} loading="lazy" decoding="async" style="width:100%;height:180px;object-fit:cover;border-radius:6px;margin-bottom:1rem;display:block;">` : renderTemplate`<div aria-hidden="true" style="width:100%;height:180px;background:var(--wash);border:1px solid var(--line);border-radius:6px;margin-bottom:1rem;"></div>`}<p class="meta">${noticia.fecha} · ${noticia.categoria}</p><h2>${noticia.titulo}</h2><p class="summary">${noticia.resumen}</p><a class="link"${addAttribute(`/noticias/${noticia.slug}`, "href")}>Leer noticia</a></article>`;
	})}</div>`}${pagination && renderTemplate`<nav class="pagination" aria-label="Paginación de noticias" style="margin-top:2.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;"><p class="meta" style="margin:0;">Página ${pagination.page} de ${pagination.pageCount} — Total ${pagination.total} noticias</p><div style="display:flex;gap:0.75rem;">${pagination.page > 1 ? renderTemplate`<a class="link"${addAttribute(`/noticias${pagination.page - 1 === 1 ? "" : `?page=${pagination.page - 1}`}`, "href")}>← Anterior</a>` : renderTemplate`<span class="meta" style="opacity:0.5;">← Anterior</span>`}${pagination.page < pagination.pageCount ? renderTemplate`<a class="link"${addAttribute(`/noticias?page=${pagination.page + 1}`, "href")}>Siguiente →</a>` : renderTemplate`<span class="meta" style="opacity:0.5;">Siguiente →</span>`}</div></nav>`}</div></main>${renderComponent($$result, "Footer", $$Footer, {})}` })}`;
}, "/home/juniorxf/proyectos/diamante/web/src/pages/noticias/index.astro", void 0);
var $$file = "/home/juniorxf/proyectos/diamante/web/src/pages/noticias/index.astro";
var $$url = "/noticias";
//#endregion
//#region \0virtual:astro:page:src/pages/noticias/index@_@astro
var page = () => noticias_exports;
//#endregion
export { page };
