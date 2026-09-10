import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { c as attachSource, i as mapStrapiEspecialidadToEspecialidad, p as fetchStrapi } from "./page_Cfa7tUOu.mjs";
//#region src/data/especialidades.ts
var especialidades_exports = /* @__PURE__ */ __exportAll({ especialidades: () => especialidades });
var especialidades = [{
	slug: "electricidad",
	nombre: "Técnico en Electricidad",
	images: ["/tecnica/electricidad/electricidad_1.jpeg"],
	descripcion: "Formación técnica orientada a las instalaciones eléctricas residenciales y a la práctica segura en taller. El estudiante desarrolla competencias básicas para el trabajo técnico y la continuidad en la educación superior.",
	puntos: [
		"Instalaciones eléctricas residenciales",
		"Seguridad eléctrica y normatividad básica",
		"Lectura e interpretación de planos eléctricos",
		"Práctica guiada en taller institucional"
	]
}, {
	slug: "sistemas",
	nombre: "Técnico en Sistemas Teleinformaticos",
	images: ["/tecnica/sistemas/sistemas_1.jpeg"],
	descripcion: "Formación técnica en el uso, mantenimiento y aprovechamiento de las tecnologías de la información. El estudiante fortalece sus competencias digitales para el ámbito académico y laboral.",
	puntos: [
		"Ofimática y herramientas digitales",
		"Mantenimiento preventivo de equipos de cómputo",
		"Fundamentos de redes básicas",
		"Introducción al desarrollo de software"
	]
}];
//#endregion
//#region src/services/especialidades.service.ts
var especialidadesService = {
	async getEspecialidades() {
		try {
			const data = (await fetchStrapi("/especialidades", { params: {
				populate: {
					imagenes: { fields: [
						"url",
						"width",
						"height",
						"formats"
					] },
					puntosDestacados: { populate: "*" }
				},
				sort: ["orden:asc", "nombre:asc"],
				pagination: { pageSize: 100 },
				status: "published"
			} })).data ?? [];
			if (!Array.isArray(data) || data.length === 0) return attachSource(especialidades, "fallback");
			return attachSource(data.map(mapStrapiEspecialidadToEspecialidad), "strapi");
		} catch (err) {
			console.warn("[especialidadesService.getEspecialidades] fallback:", err);
			return attachSource(especialidades, "fallback");
		}
	},
	async getEspecialidadBySlug(slug) {
		try {
			const data = (await fetchStrapi("/especialidades", { params: {
				filters: { slug: { $eq: slug } },
				populate: {
					imagenes: { fields: [
						"url",
						"width",
						"height"
					] },
					puntosDestacados: { populate: "*" }
				},
				pagination: { pageSize: 1 },
				status: "published"
			} })).data ?? [];
			const raw = Array.isArray(data) ? data[0] : null;
			if (!raw) {
				const fb = especialidades.find((e) => e.slug === slug);
				return fb ? attachSource(fb, "fallback") : void 0;
			}
			return attachSource(mapStrapiEspecialidadToEspecialidad(raw), "strapi");
		} catch (err) {
			console.warn("[especialidadesService.getEspecialidadBySlug] fallback:", err);
			const fb = especialidades.find((e) => e.slug === slug);
			return fb ? attachSource(fb, "fallback") : void 0;
		}
	}
};
//#endregion
export { especialidades_exports as n, especialidadesService as t };
