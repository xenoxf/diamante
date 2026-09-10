import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { C as createAstro, d as renderTemplate, f as maybeRenderHead, i as renderComponent } from "./server_Cw-A2kAj.mjs";
import { t as createComponent } from "./compiler_BI4hSaVN.mjs";
import { a as mapStrapiGaleriaItemToLegacy, c as attachSource, d as $$Header, f as $$Layout, l as readSource, n as $$Footer, o as mapStrapiGaleriaToGalleryImages, p as fetchStrapi, t as $$PageHero } from "./page_Cfa7tUOu.mjs";
import { t as $$DataSourceBadge } from "./DataSourceBadge_D8ujJDZl.mjs";
import { t as setISRHeaders } from "./isr_DLUhkWmb.mjs";
import { t as Masonry } from "./mansory_BwgeP95X.mjs";
//#region src/data/galeria.ts
var galeria = [
	{
		id: "g1",
		titulo: "Jornada de aseo y embellecimiento",
		categoria: "Sedes"
	},
	{
		id: "g2",
		titulo: "Encuentro deportivo inter-sedes",
		categoria: "Deporte"
	},
	{
		id: "g3",
		titulo: "Muestra cultural institucional",
		categoria: "Cultura"
	},
	{
		id: "g4",
		titulo: "Feria de la ciencia escolar",
		categoria: "Académico"
	},
	{
		id: "g5",
		titulo: "Acto de izada de bandera",
		categoria: "Académico"
	},
	{
		id: "g6",
		titulo: "Torneo de fútbol intercolegiado",
		categoria: "Deporte"
	},
	{
		id: "g7",
		titulo: "Presentación de danzas folclóricas",
		categoria: "Cultura"
	},
	{
		id: "g8",
		titulo: "Entrega de sede restaurada",
		categoria: "Sedes"
	}
];
//#endregion
//#region src/services/galeria.service.ts
/**
* Fallback para GalleryImage cuando Strapi no tiene imágenes.
* Replica lógica picsum fallback previa (ver landscape.service original).
*/
var FALLBACK_IDS = [
	"1015",
	"1016",
	"1018",
	"1019",
	"1036",
	"1039",
	"10",
	"28"
];
var TARGET_HREF = "/galeria";
function picsumSrc(id, w, h) {
	return `https://picsum.photos/id/${id}/${w}/${h}`;
}
function picsumGalleryFallback(count) {
	const ratios = [
		[600, 800],
		[600, 450],
		[600, 600],
		[600, 750],
		[600, 500],
		[600, 850]
	];
	return Array.from({ length: count }, (_, i) => {
		const id = FALLBACK_IDS[i % FALLBACK_IDS.length];
		const [w, h] = ratios[i % ratios.length];
		return {
			id: `galeria-${id}-${i}`,
			src: picsumSrc(id, w, h),
			width: w,
			height: h,
			alt: "",
			href: TARGET_HREF
		};
	});
}
var galeriaService = {
	async getGaleria() {
		try {
			const data = (await fetchStrapi("/galeria-items", { params: {
				populate: {
					categoria: { fields: ["nombre", "slug"] },
					imagen: { fields: [
						"url",
						"width",
						"height"
					] }
				},
				sort: ["orden:asc", "titulo:asc"],
				pagination: { pageSize: 100 },
				status: "published"
			} })).data ?? [];
			if (!Array.isArray(data) || data.length === 0) return galeria;
			return data.map(mapStrapiGaleriaItemToLegacy);
		} catch (err) {
			console.warn("[galeriaService.getGaleria] fallback:", err);
			return galeria;
		}
	},
	async getGaleriaByCategoria(categoria) {
		try {
			const filtrados = (await this.getGaleria()).filter((g) => g.categoria.toLowerCase() === categoria.toLowerCase());
			if (filtrados.length > 0) return filtrados;
			const slug = categoria.toLowerCase().replace(/\s+/g, "-");
			try {
				const data = (await fetchStrapi("/galeria-items", { params: {
					filters: { categoria: { slug: { $eq: slug } } },
					populate: { categoria: { fields: ["nombre", "slug"] } },
					pagination: { pageSize: 100 },
					status: "published"
				} })).data ?? [];
				if (Array.isArray(data) && data.length > 0) return data.map(mapStrapiGaleriaItemToLegacy);
			} catch {}
			return galeria.filter((g) => g.categoria === categoria);
		} catch {
			return galeria.filter((g) => g.categoria === categoria);
		}
	},
	async getGaleriaImages(count = 16, signal, opts) {
		let actualSignal = signal;
		let actualOpts = opts;
		if (signal && typeof signal === "object" && !(signal instanceof AbortSignal) && !("aborted" in signal)) {
			actualOpts = signal;
			actualSignal = void 0;
		}
		const destacadoHome = actualOpts?.destacadoHome;
		try {
			const params = {
				populate: {
					imagen: { fields: [
						"url",
						"width",
						"height",
						"formats",
						"alternativeText"
					] },
					categoria: { fields: ["nombre", "slug"] }
				},
				sort: ["orden:asc", "createdAt:desc"],
				pagination: { pageSize: count },
				status: "published"
			};
			if (typeof destacadoHome === "boolean") params.filters = { destacadoHome: { $eq: destacadoHome } };
			const data = (await fetchStrapi("/galeria-items", {
				params,
				fetchOptions: { signal: actualSignal }
			})).data ?? [];
			const images = mapStrapiGaleriaToGalleryImages(data).slice(0, count);
			if (images.length >= Math.min(6, count)) return attachSource(images, "strapi");
			if (typeof destacadoHome === "boolean" && images.length < Math.min(6, count)) try {
				const data2 = (await fetchStrapi("/galeria-items", {
					params: {
						populate: {
							imagen: { fields: [
								"url",
								"width",
								"height",
								"formats",
								"alternativeText"
							] },
							categoria: { fields: ["nombre", "slug"] }
						},
						sort: ["orden:asc", "createdAt:desc"],
						pagination: { pageSize: count },
						status: "published"
					},
					fetchOptions: { signal: actualSignal }
				})).data ?? [];
				const images2 = mapStrapiGaleriaToGalleryImages(data2).slice(0, count);
				if (images2.length > 0) {
					if (images2.length >= Math.min(6, count)) return attachSource(images2, "strapi");
					if (images2.length < count) {
						const missing = count - images2.length;
						return attachSource([...images2, ...picsumGalleryFallback(missing)], "fallback");
					}
				}
			} catch {}
			if (images.length > 0 && images.length < count) {
				const missing = count - images.length;
				return attachSource([...images, ...picsumGalleryFallback(missing)], "fallback");
			}
			if (images.length === 0) throw new Error("Sin imágenes Strapi");
			return attachSource(images, "strapi");
		} catch (err) {
			if (actualSignal?.aborted) return [];
			console.warn("[galeriaService.getGaleriaImages] Strapi falla, usando picsum fallback:", err);
			return attachSource(picsumGalleryFallback(count), "fallback");
		}
	},
	/**
	* Versión genérica que acepta params Strapi directos (pagination, populate, filters, sort).
	* Útil para galeria.astro que requiere filtros por categoría y pagination.
	* Usa getStrapiMediaUrl internamente via mapper.
	*/
	async getGaleriaItems(params, signal) {
		try {
			const merged = {
				populate: {
					imagen: { fields: [
						"url",
						"width",
						"height",
						"formats",
						"alternativeText"
					] },
					categoria: { fields: ["nombre", "slug"] }
				},
				sort: ["orden:asc", "createdAt:desc"],
				status: "published",
				...params
			};
			if (!merged.populate) merged.populate = {
				imagen: { fields: [
					"url",
					"width",
					"height",
					"formats",
					"alternativeText"
				] },
				categoria: { fields: ["nombre", "slug"] }
			};
			const data = (await fetchStrapi("/galeria-items", {
				params: merged,
				fetchOptions: { signal }
			})).data ?? [];
			const images = mapStrapiGaleriaToGalleryImages(data);
			if (images.length === 0) return [];
			return images;
		} catch (err) {
			if (signal?.aborted) return [];
			console.warn("[galeriaService.getGaleriaItems] fallback:", err);
			return [];
		}
	}
};
//#endregion
//#region src/pages/galeria.astro
var galeria_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Galeria,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://diamante-nu.vercel.app");
var $$Galeria = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Galeria;
	setISRHeaders(Astro.response, { sMaxAge: 180 });
	let fotos = [];
	try {
		fotos = await galeriaService.getGaleriaImages(18);
	} catch (err) {
		console.warn("[galeria] getGaleriaImages fallback:", err);
		fotos = [];
	}
	const source = readSource(fotos);
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Header", $$Header, {})}${maybeRenderHead($$result)}<main class="page">${renderComponent($$result, "PageHero", $$PageHero, {
		"kicker": "Galería",
		"title": "Galería institucional"
	})}<div class="container container--full"><p class="intro">Registro fotográfico de las actividades académicas, culturales y deportivas de la Institución Educativa El Diamante.</p><div style="margin: 0 0 12px;">${renderComponent($$result, "DataSourceBadge", $$DataSourceBadge, { "source": source })}</div>${fotos.length > 0 ? renderTemplate`${renderComponent($$result, "Mansory", Masonry, { "fotos": fotos })}` : renderTemplate`<p class="empty">No hay imágenes disponibles en este momento.</p>`}</div></main>${renderComponent($$result, "Footer", $$Footer, {})}` })}`;
}, "/home/juniorxf/proyectos/diamante/web/src/pages/galeria.astro", void 0);
var $$file = "/home/juniorxf/proyectos/diamante/web/src/pages/galeria.astro";
var $$url = "/galeria";
//#endregion
//#region \0virtual:astro:page:src/pages/galeria@_@astro
var page = () => galeria_exports;
//#endregion
export { page };
