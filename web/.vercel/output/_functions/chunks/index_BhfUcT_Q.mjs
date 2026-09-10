import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { b as unescapeHTML, d as renderTemplate, f as maybeRenderHead, i as renderComponent, m as addAttribute } from "./server_Cw-A2kAj.mjs";
import { t as createComponent } from "./compiler_BI4hSaVN.mjs";
import { d as $$Header, f as $$Layout, l as readSource, m as getStrapiMediaUrl, n as $$Footer, t as $$PageHero } from "./page_Cfa7tUOu.mjs";
import { t as $$DataSourceBadge } from "./DataSourceBadge_D8ujJDZl.mjs";
import { t as especialidadesService } from "./especialidades.service_CsUTX83t.mjs";
import { t as Masonry } from "./mansory_BwgeP95X.mjs";
//#region src/pages/especialidades/index.astro
var especialidades_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	let especialidades = [];
	try {
		especialidades = await especialidadesService.getEspecialidades();
	} catch (err) {
		console.warn("[especialidades/index] fallback:", err);
		const { especialidades: fallback } = await import("./especialidades.service_CsUTX83t.mjs").then((n) => n.n);
		especialidades = fallback;
	}
	const source = readSource(especialidades);
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "data-astro-cid-g3wtvizk": true }, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Header", $$Header, { "data-astro-cid-g3wtvizk": true })}${maybeRenderHead($$result)}<main class="page" data-astro-cid-g3wtvizk>${renderComponent($$result, "PageHero", $$PageHero, {
		"kicker": "Oferta académica",
		"title": "Especialidades",
		"data-astro-cid-g3wtvizk": true
	})}<div class="container container--wide" data-astro-cid-g3wtvizk><p class="lead" data-astro-cid-g3wtvizk>La Institución Educativa El Diamante ofrece formación en distintas especialidades de la educación media, orientadas a la continuidad educativa y a la vinculación al mundo productivo.</p><div style="margin: 0 0 12px;" data-astro-cid-g3wtvizk>${renderComponent($$result, "DataSourceBadge", $$DataSourceBadge, {
		"source": source,
		"data-astro-cid-g3wtvizk": true
	})}</div><div class="grid" data-astro-cid-g3wtvizk>${especialidades.map((esp) => {
		const imgs = esp.images?.length ? esp.images : [getStrapiMediaUrl(esp.imagenes)].filter(Boolean);
		const fotos = (imgs.length > 0 ? imgs : [`/tecnica/${esp.slug}/${esp.slug}_1.jpeg`]).map((src, idx) => ({
			id: `${esp.slug}-${idx}`,
			src,
			width: 800,
			height: 600,
			alt: `${esp.nombre} imagen ${idx + 1}`,
			href: src
		}));
		return renderTemplate`<article class="card" data-astro-cid-g3wtvizk>${fotos.length > 1 ? renderTemplate`${renderComponent($$result, "Masonry", Masonry, {
			"fotos": fotos,
			"client:visible": true,
			"data-astro-cid-g3wtvizk": true,
			"client:component-hydration": "visible",
			"client:component-path": "/home/juniorxf/proyectos/diamante/web/src/components/mansory.tsx",
			"client:component-export": "default"
		})}` : renderTemplate`<img${addAttribute(fotos[0].src, "src")}${addAttribute(fotos[0].alt, "alt")} loading="lazy" decoding="async" style="width:100%;height:auto;" data-astro-cid-g3wtvizk>`}<h2 data-astro-cid-g3wtvizk>${esp.nombre}</h2><div data-astro-cid-g3wtvizk>${unescapeHTML(esp.descripcion)}</div>${esp.puntos && esp.puntos.length > 0 && renderTemplate`<ul style="margin:0.75rem 0 1rem 1.25rem;line-height:1.6;" data-astro-cid-g3wtvizk>${esp.puntos.slice(0, 3).map((p) => renderTemplate`<li data-astro-cid-g3wtvizk>${p}</li>`)}</ul>`}<a class="link"${addAttribute(`/especialidades/${esp.slug}`, "href")} data-astro-cid-g3wtvizk>Ver especialidad</a></article>`;
	})}</div></div></main>${renderComponent($$result, "Footer", $$Footer, { "data-astro-cid-g3wtvizk": true })}` })}`;
}, "/home/juniorxf/proyectos/diamante/web/src/pages/especialidades/index.astro", void 0);
var $$file = "/home/juniorxf/proyectos/diamante/web/src/pages/especialidades/index.astro";
var $$url = "/especialidades";
//#endregion
//#region \0virtual:astro:page:src/pages/especialidades/index@_@astro
var page = () => especialidades_exports;
//#endregion
export { page };
