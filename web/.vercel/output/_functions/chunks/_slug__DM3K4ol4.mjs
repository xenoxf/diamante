import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { C as createAstro, a as Fragment, b as unescapeHTML, d as renderTemplate, f as maybeRenderHead, i as renderComponent, m as addAttribute } from "./server_Cw-A2kAj.mjs";
import { t as createComponent } from "./compiler_BI4hSaVN.mjs";
import { d as $$Header, f as $$Layout, l as readSource, m as getStrapiMediaUrl, n as $$Footer, t as $$PageHero } from "./page_JcrvOEkv.mjs";
import { t as $$DataSourceBadge } from "./DataSourceBadge_D8ujJDZl.mjs";
import { t as setISRHeaders } from "./isr_DLUhkWmb.mjs";
import { t as noticiasService } from "./noticias.service_BJUx29hU.mjs";
//#region src/pages/noticias/[slug].astro
var _slug__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Slug,
	file: () => $$file,
	getStaticPaths: () => getStaticPaths,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://diamante-nu.vercel.app");
async function getStaticPaths() {
	try {
		return (await noticiasService.getNoticias()).map((n) => ({
			params: { slug: n.slug },
			props: { noticia: n }
		}));
	} catch (err) {
		console.warn("[noticias/[slug] getStaticPaths] fallback:", err);
		const { noticias: fallback } = await import("./noticias.service_BJUx29hU.mjs").then((n) => n.n);
		return fallback.map((n) => ({
			params: { slug: n.slug },
			props: { noticia: n }
		}));
	}
}
var $$Slug = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Slug;
	setISRHeaders(Astro.response, { sMaxAge: 300 });
	const { slug } = Astro.params;
	let noticia = Astro.props?.noticia;
	if (!noticia || !noticia.contenido) try {
		const fetched = await noticiasService.getNoticiaBySlug(String(slug));
		if (fetched) noticia = fetched;
	} catch (err) {
		console.warn("[noticias/[slug]] getNoticiaBySlug fallback:", err);
	}
	if (!noticia) {}
	const portadaUrl = noticia?.portadaUrl ?? getStrapiMediaUrl(noticia?.portada) ?? null;
	const galeriaUrls = noticia?.galeriaUrls ?? (Array.isArray(noticia?.galeria) ? noticia.galeria.map((m) => getStrapiMediaUrl(m)).filter(Boolean) : []);
	const contenidoHtml = noticia?.contenido ?? "";
	const detailSource = readSource(Astro.props?.noticia ?? noticia);
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": noticia ? `${noticia.titulo} — IE El Diamante` : void 0,
		"description": noticia?.resumen?.slice(0, 160) || void 0,
		"image": portadaUrl || void 0,
		"data-astro-cid-rtrzjwax": true
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Header", $$Header, { "data-astro-cid-rtrzjwax": true })}${maybeRenderHead($$result)}<main class="page" data-astro-cid-rtrzjwax>${noticia ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "PageHero", $$PageHero, {
		"kicker": noticia.categoria,
		"title": noticia.titulo,
		"data-astro-cid-rtrzjwax": true
	})}<div class="container" data-astro-cid-rtrzjwax><div style="margin: 0 0 12px;" data-astro-cid-rtrzjwax>${renderComponent($$result, "DataSourceBadge", $$DataSourceBadge, {
		"source": detailSource,
		"data-astro-cid-rtrzjwax": true
	})}</div><p class="meta" data-astro-cid-rtrzjwax>${noticia.fecha} · ${noticia.categoria}</p><p class="lead lead--strong" data-astro-cid-rtrzjwax>${noticia.resumen}</p>${portadaUrl && renderTemplate`<p data-astro-cid-rtrzjwax><img class="figure-img"${addAttribute(portadaUrl, "src")}${addAttribute(`Portada de ${noticia.titulo}`, "alt")} loading="lazy" decoding="async" data-astro-cid-rtrzjwax></p>`}${contenidoHtml ? renderTemplate`<div class="richtext" data-astro-cid-rtrzjwax>${unescapeHTML(contenidoHtml)}</div>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`<p data-astro-cid-rtrzjwax>La Institución Educativa El Diamante invita a la comunidad a mantenerse informada a través de los canales oficiales. Los detalles de esta publicación se amplían en cada sede y en las comunicaciones dirigidas a estudiantes y acudientes.</p><p data-astro-cid-rtrzjwax>Para mayor información, las personas interesadas pueden acercarse a la secretaría de la sede correspondiente en el horario de atención establecido.</p>` })}`}${galeriaUrls.length > 0 && renderTemplate`<div style="margin-top:2rem;" data-astro-cid-rtrzjwax><h2 data-astro-cid-rtrzjwax>Galería</h2><div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));" data-astro-cid-rtrzjwax>${galeriaUrls.map((src) => renderTemplate`<img class="figure-img"${addAttribute(src, "src")}${addAttribute(`Imagen de ${noticia.titulo}`, "alt")} loading="lazy" decoding="async" style="height:180px;object-fit:cover;" data-astro-cid-rtrzjwax>`)}</div></div>`}<p class="back" data-astro-cid-rtrzjwax><a href="/noticias" data-astro-cid-rtrzjwax>Volver a todas las noticias</a></p></div>` })}` : renderTemplate`<div class="container" data-astro-cid-rtrzjwax><h1 data-astro-cid-rtrzjwax>Noticia no encontrada</h1><p class="lead" data-astro-cid-rtrzjwax>La noticia solicitada no existe o fue movida.</p><p class="back" data-astro-cid-rtrzjwax><a href="/noticias" data-astro-cid-rtrzjwax>Volver a todas las noticias</a></p></div>`}</main>${renderComponent($$result, "Footer", $$Footer, { "data-astro-cid-rtrzjwax": true })}` })}`;
}, "/home/juniorxf/proyectos/diamante/web/src/pages/noticias/[slug].astro", void 0);
var $$file = "/home/juniorxf/proyectos/diamante/web/src/pages/noticias/[slug].astro";
var $$url = "/noticias/[slug]";
//#endregion
//#region \0virtual:astro:page:src/pages/noticias/[slug]@_@astro
var page = () => _slug__exports;
//#endregion
export { page };
