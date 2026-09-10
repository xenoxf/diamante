import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { C as createAstro, a as Fragment, b as unescapeHTML, d as renderTemplate, f as maybeRenderHead, i as renderComponent, m as addAttribute } from "./server_Cw-A2kAj.mjs";
import { t as createComponent } from "./compiler_BI4hSaVN.mjs";
import { d as $$Header, f as $$Layout, h as getStrapiMediaUrls, l as readSource, n as $$Footer, t as $$PageHero } from "./page_Cfa7tUOu.mjs";
import { t as $$DataSourceBadge } from "./DataSourceBadge_D8ujJDZl.mjs";
import { t as especialidadesService } from "./especialidades.service_CsUTX83t.mjs";
import { t as setISRHeaders } from "./isr_DLUhkWmb.mjs";
import { t as Masonry } from "./mansory_BwgeP95X.mjs";
//#region src/pages/especialidades/[slug].astro
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
		return (await especialidadesService.getEspecialidades()).map((e) => ({
			params: { slug: e.slug },
			props: { especialidad: e }
		}));
	} catch (err) {
		console.warn("[especialidades/[slug] getStaticPaths] fallback:", err);
		const { especialidades: fallback } = await import("./especialidades.service_CsUTX83t.mjs").then((n) => n.n);
		return fallback.map((e) => ({
			params: { slug: e.slug },
			props: { especialidad: e }
		}));
	}
}
var $$Slug = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Slug;
	setISRHeaders(Astro.response, { sMaxAge: 300 });
	let especialidad = Astro.props?.especialidad;
	const slugParam = Astro.params.slug;
	if (!especialidad || especialidad.slug !== slugParam || !especialidad.puntos || !especialidad.images) try {
		const fetched = await especialidadesService.getEspecialidadBySlug(String(slugParam));
		if (fetched) especialidad = fetched;
	} catch (err) {
		console.warn("[especialidades/[slug]] getEspecialidadBySlug fallback:", err);
	}
	const puntos = especialidad?.puntos ?? [];
	const imagenes = especialidad?.images ?? getStrapiMediaUrls(especialidad?.imagenes) ?? [];
	const displayImgs = imagenes.length > 0 ? imagenes : especialidad?.slug ? [`/tecnica/${especialidad.slug}/${especialidad.slug}_1.jpeg`] : [];
	const galleryImages = displayImgs.map((src, idx) => ({
		id: `${especialidad?.slug ?? "especialidad"}-${idx}`,
		src,
		width: 800,
		height: 600,
		alt: `${especialidad?.nombre ?? "Especialidad"} imagen ${idx + 1}`,
		href: src
	}));
	const detailSource = readSource(Astro.props?.especialidad ?? especialidad);
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "data-astro-cid-4i5mssvq": true }, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Header", $$Header, { "data-astro-cid-4i5mssvq": true })}${maybeRenderHead($$result)}<main class="page" data-astro-cid-4i5mssvq>${especialidad ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "PageHero", $$PageHero, {
		"kicker": "Oferta académica",
		"title": especialidad.nombre,
		"data-astro-cid-4i5mssvq": true
	})}<div class="container" data-astro-cid-4i5mssvq><div style="margin: 0 0 12px;" data-astro-cid-4i5mssvq>${renderComponent($$result, "DataSourceBadge", $$DataSourceBadge, {
		"source": detailSource,
		"data-astro-cid-4i5mssvq": true
	})}</div><div class="lead" data-astro-cid-4i5mssvq>${unescapeHTML(especialidad.descripcion)}</div>${puntos.length > 0 && renderTemplate`<div style="margin-top:1.5rem;" data-astro-cid-4i5mssvq><h2 data-astro-cid-4i5mssvq>Puntos destacados</h2><ul class="points" data-astro-cid-4i5mssvq>${puntos.map((p) => renderTemplate`<li data-astro-cid-4i5mssvq>${p}</li>`)}</ul></div>`}${displayImgs.length > 0 && renderTemplate`<div style="margin-top:2rem;" data-astro-cid-4i5mssvq><h2 data-astro-cid-4i5mssvq>Galería</h2>${galleryImages.length > 1 ? renderTemplate`${renderComponent($$result, "Masonry", Masonry, {
		"fotos": galleryImages,
		"data-astro-cid-4i5mssvq": true
	})}` : renderTemplate`<div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));" data-astro-cid-4i5mssvq>${displayImgs.map((src, idx) => renderTemplate`<img class="figure-img"${addAttribute(src, "src")}${addAttribute(`${especialidad.nombre} imagen ${idx + 1}`, "alt")} loading="lazy" decoding="async" style="height:200px;object-fit:cover;" data-astro-cid-4i5mssvq>`)}</div>`}</div>`}${especialidad.duracion && renderTemplate`<p class="meta" style="margin-top:1.5rem;" data-astro-cid-4i5mssvq><strong data-astro-cid-4i5mssvq>Duración:</strong> ${especialidad.duracion}</p>`}${especialidad.planEstudioUrl && renderTemplate`<p data-astro-cid-4i5mssvq><a class="link"${addAttribute(especialidad.planEstudioUrl, "href")} target="_blank" rel="noopener" data-astro-cid-4i5mssvq>Ver plan de estudio</a></p>`}<p class="back" data-astro-cid-4i5mssvq><a href="/especialidades" data-astro-cid-4i5mssvq>Volver a todas las especialidades</a></p></div>` })}` : renderTemplate`<div class="container" data-astro-cid-4i5mssvq><h1 data-astro-cid-4i5mssvq>Especialidad no encontrada</h1><p data-astro-cid-4i5mssvq>La especialidad solicitada no existe.</p><p class="back" data-astro-cid-4i5mssvq><a href="/especialidades" data-astro-cid-4i5mssvq>Volver a todas las especialidades</a></p></div>`}</main>${renderComponent($$result, "Footer", $$Footer, { "data-astro-cid-4i5mssvq": true })}` })}`;
}, "/home/juniorxf/proyectos/diamante/web/src/pages/especialidades/[slug].astro", void 0);
var $$file = "/home/juniorxf/proyectos/diamante/web/src/pages/especialidades/[slug].astro";
var $$url = "/especialidades/[slug]";
//#endregion
//#region \0virtual:astro:page:src/pages/especialidades/[slug]@_@astro
var page = () => _slug__exports;
//#endregion
export { page };
