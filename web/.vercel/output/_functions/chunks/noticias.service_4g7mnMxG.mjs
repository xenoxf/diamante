import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { c as attachSource, p as fetchStrapi, s as mapStrapiNoticiaToNoticia } from "./page_Cfa7tUOu.mjs";
//#region src/data/noticias.ts
var noticias_exports = /* @__PURE__ */ __exportAll({ noticias: () => noticias });
var noticias = [
	{
		slug: "invitacion-no-15-2026",
		titulo: "Invitación No.15-2026",
		fecha: "4 de agosto de 2026",
		categoria: "Contratación",
		resumen: "Invitación pública para el mantenimiento locativo de la institución educativa."
	},
	{
		slug: "invitacion-no-14-2026",
		titulo: "Invitación No.14-2026",
		fecha: "4 de agosto de 2026",
		categoria: "Contratación",
		resumen: "Invitación pública para el suministro de papelería y kits escolares."
	},
	{
		slug: "invitacion-no-13-2026",
		titulo: "Invitación No.13-2026",
		fecha: "4 de agosto de 2026",
		categoria: "Contratación",
		resumen: "Invitación pública para el suministro de implementos de aseo."
	},
	{
		slug: "celebracion-del-dia-de-la-afrocolombianidad",
		titulo: "Celebración del Día de la Afrocolombianidad",
		fecha: "4 de agosto de 2026",
		categoria: "Institucional",
		resumen: "Jornada institucional de reconocimiento a la historia, la cultura y los aportes de la comunidad afrocolombiana."
	},
	{
		slug: "lista-de-utiles-escolares-2026",
		titulo: "Lista de útiles escolares 2026",
		fecha: "4 de agosto de 2026",
		categoria: "Académico",
		resumen: "Consulte la lista oficial de útiles escolares por grado para el año lectivo 2026."
	},
	{
		slug: "juegos-intercolegiados-regionales",
		titulo: "Juegos Intercolegiados Regionales",
		fecha: "4 de agosto de 2026",
		categoria: "Académico",
		resumen: "Participación de las selecciones institucionales en los Juegos Intercolegiados Regionales."
	}
];
//#endregion
//#region src/services/noticias.service.ts
function applyFallbackPagination(fallback, query) {
	let result = [...fallback];
	if (query?.destacada) {
		const destacadasFallback = result.filter((n) => n.destacada);
		if (destacadasFallback.length > 0) result = destacadasFallback;
	}
	if (query?.limit !== void 0) return result.slice(0, query.limit);
	if (query?.page !== void 0 || query?.pageSize !== void 0) {
		const page = query.page ?? 1;
		const pageSize = query.pageSize ?? 6;
		const start = (page - 1) * pageSize;
		return result.slice(start, start + pageSize);
	}
	return result;
}
var noticiasService = {
	async getNoticias(query) {
		try {
			const filters = {};
			if (query?.destacada !== void 0) filters.destacada = { $eq: query.destacada };
			const pagination = {};
			if (query?.limit !== void 0) {
				pagination.pageSize = query.limit;
				pagination.page = 1;
			} else if (query?.page !== void 0 || query?.pageSize !== void 0) {
				pagination.page = query.page ?? 1;
				pagination.pageSize = query.pageSize ?? 6;
			} else {
				pagination.pageSize = 100;
				pagination.page = 1;
			}
			const data = (await fetchStrapi("/noticias", { params: {
				populate: {
					categoria: { fields: ["nombre", "slug"] },
					portada: { fields: [
						"url",
						"width",
						"height",
						"formats"
					] },
					galeria: { fields: [
						"url",
						"width",
						"height",
						"formats"
					] }
				},
				sort: ["fechaPublicacion:desc", "createdAt:desc"],
				...Object.keys(filters).length > 0 ? { filters } : {},
				pagination,
				status: "published"
			} })).data ?? [];
			if (!Array.isArray(data) || data.length === 0) return attachSource(applyFallbackPagination(noticias, query), "fallback");
			const mapped = data.map(mapStrapiNoticiaToNoticia);
			if (mapped.length === 0) return attachSource(applyFallbackPagination(noticias, query), "fallback");
			return attachSource(mapped, "strapi");
		} catch (err) {
			console.warn("[noticiasService.getNoticias] Strapi falla, usando fallback local:", err);
			return attachSource(applyFallbackPagination(noticias, query), "fallback");
		}
	},
	async getNoticiasPaginated(query) {
		const page = query?.page ?? 1;
		const pageSize = query?.pageSize ?? query?.limit ?? 6;
		try {
			const filters = {};
			if (query?.destacada !== void 0) filters.destacada = { $eq: query.destacada };
			const res = await fetchStrapi("/noticias", { params: {
				populate: {
					categoria: { fields: ["nombre", "slug"] },
					portada: { fields: [
						"url",
						"width",
						"height",
						"formats"
					] },
					galeria: { fields: [
						"url",
						"width",
						"height",
						"formats"
					] }
				},
				sort: ["fechaPublicacion:desc", "createdAt:desc"],
				...Object.keys(filters).length > 0 ? { filters } : {},
				pagination: {
					page,
					pageSize
				},
				status: "published"
			} });
			const data = res.data ?? [];
			const rawPagination = (res.meta ?? {})?.pagination ?? {
				page,
				pageSize,
				pageCount: 1,
				total: data.length
			};
			if (!Array.isArray(data) || data.length === 0) {
				const fallbackSlice = applyFallbackPagination(noticias, {
					page,
					pageSize,
					destacada: query?.destacada
				});
				const total = query?.destacada ? noticias.filter((n) => n.destacada).length || noticias.length : noticias.length;
				return {
					data: fallbackSlice,
					pagination: {
						page,
						pageSize,
						pageCount: Math.ceil(total / pageSize),
						total
					}
				};
			}
			const mapped = data.map(mapStrapiNoticiaToNoticia);
			return {
				data: mapped,
				pagination: {
					page: rawPagination.page ?? page,
					pageSize: rawPagination.pageSize ?? pageSize,
					pageCount: rawPagination.pageCount ?? Math.ceil((rawPagination.total ?? mapped.length) / pageSize),
					total: rawPagination.total ?? mapped.length
				}
			};
		} catch (err) {
			console.warn("[noticiasService.getNoticiasPaginated] fallback:", err);
			const fallbackSlice = applyFallbackPagination(noticias, {
				page,
				pageSize,
				destacada: query?.destacada
			});
			const total = query?.destacada ? noticias.filter((n) => n.destacada).length || noticias.length : noticias.length;
			return {
				data: fallbackSlice,
				pagination: {
					page,
					pageSize,
					pageCount: Math.max(1, Math.ceil(total / pageSize)),
					total
				}
			};
		}
	},
	async getNoticiaBySlug(slug) {
		try {
			const data = (await fetchStrapi("/noticias", { params: {
				filters: { slug: { $eq: slug } },
				populate: {
					categoria: { fields: ["nombre", "slug"] },
					portada: { fields: [
						"url",
						"width",
						"height",
						"formats"
					] },
					galeria: { fields: [
						"url",
						"width",
						"height",
						"formats"
					] }
				},
				pagination: { pageSize: 1 },
				status: "published"
			} })).data ?? [];
			const raw = Array.isArray(data) ? data[0] : null;
			if (!raw) {
				const fb = noticias.find((n) => n.slug === slug);
				return fb ? attachSource(fb, "fallback") : void 0;
			}
			return attachSource(mapStrapiNoticiaToNoticia(raw), "strapi");
		} catch (err) {
			console.warn("[noticiasService.getNoticiaBySlug] fallback:", err);
			const fb = noticias.find((n) => n.slug === slug);
			return fb ? attachSource(fb, "fallback") : void 0;
		}
	},
	async getNoticiasByCategoria(categoria) {
		try {
			const slugCat = categoria.toLowerCase().replace(/\s+/g, "-");
			try {
				const data = (await fetchStrapi("/noticias", { params: {
					filters: { categoria: { slug: { $eq: slugCat } } },
					populate: {
						categoria: { fields: ["nombre", "slug"] },
						portada: { fields: [
							"url",
							"width",
							"height",
							"formats"
						] }
					},
					sort: ["fechaPublicacion:desc"],
					pagination: { pageSize: 100 },
					status: "published"
				} })).data ?? [];
				if (Array.isArray(data) && data.length > 0) return data.map(mapStrapiNoticiaToNoticia);
			} catch {}
			const filtradas = (await this.getNoticias()).filter((n) => n.categoria.toLowerCase() === categoria.toLowerCase());
			return filtradas.length > 0 ? filtradas : noticias.filter((n) => n.categoria === categoria);
		} catch {
			return noticias.filter((n) => n.categoria === categoria);
		}
	}
};
//#endregion
export { noticias_exports as n, noticiasService as t };
