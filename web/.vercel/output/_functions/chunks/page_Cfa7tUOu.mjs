import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { C as createAstro, a as Fragment, b as unescapeHTML, c as renderSlot, d as renderTemplate, f as maybeRenderHead, h as createRenderInstruction, i as renderComponent, m as addAttribute, p as renderHead } from "./server_Cw-A2kAj.mjs";
import { t as createComponent } from "./compiler_BI4hSaVN.mjs";
//#region node_modules/.pnpm/astro@7.2.10_@emnapi+core@1.11.1_@emnapi+runtime@1.11.3_@types+node@24.13.3_@vercel+functions@3.9.6/node_modules/astro/dist/runtime/server/render/script.js
async function renderScript(result, id) {
	const inlined = result.inlinedScripts.get(id);
	let content = "";
	if (inlined != null) {
		if (inlined) content = `<script type="module">${inlined}<\/script>`;
	} else {
		const resolved = await result.resolve(id);
		content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"><\/script>`;
	}
	return createRenderInstruction({
		type: "script",
		id,
		content
	});
}
//#endregion
//#region src/lib/strapi.ts
var STRAPI_URL = typeof import.meta !== "undefined" && (Object.assign({
	"ASSETS_PREFIX": void 0,
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SITE": "https://diamante-nu.vercel.app",
	"SSR": true
}, { _: "/home/juniorxf/.local/share/../bin/npm" })?.PUBLIC_STRAPI_URL || Object.assign({
	"ASSETS_PREFIX": void 0,
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SITE": "https://diamante-nu.vercel.app",
	"SSR": true
}, { _: "/home/juniorxf/.local/share/../bin/npm" })?.STRAPI_URL) || "http://localhost:1337";
var STRAPI_TOKEN = typeof import.meta !== "undefined" && Object.assign({
	"ASSETS_PREFIX": void 0,
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SITE": "https://diamante-nu.vercel.app",
	"SSR": true
}, { _: "/home/juniorxf/.local/share/../bin/npm" })?.STRAPI_API_TOKEN || void 0;
function buildQuery(params) {
	if (!params || typeof params !== "object") return "";
	const search = new URLSearchParams();
	function append(key, value) {
		if (value === null || value === void 0) return;
		if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
			search.append(key, String(value));
			return;
		}
		if (Array.isArray(value)) {
			value.forEach((v, i) => {
				append(`${key}[${i}]`, v);
			});
			return;
		}
		if (typeof value === "object") Object.entries(value).forEach(([sub, v]) => {
			append(`${key}[${sub}]`, v);
		});
	}
	Object.entries(params).forEach(([k, v]) => append(k, v));
	return search.toString();
}
function getStrapiMediaUrl(media) {
	if (!media) return null;
	if (typeof media === "string") {
		if (media.startsWith("http://") || media.startsWith("https://")) return media;
		if (media.startsWith("//")) return `https:${media}`;
		return `${STRAPI_URL}${media.startsWith("/") ? "" : "/"}${media}`;
	}
	if (Array.isArray(media)) {
		if (media.length === 0) return null;
		return getStrapiMediaUrl(media[0]);
	}
	if (media?.data) return getStrapiMediaUrl(media.data);
	if (typeof media?.url === "string") {
		const url = media.url;
		if (url.startsWith("http://") || url.startsWith("https://")) return url;
		if (url.startsWith("//")) return `https:${url}`;
		return `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
	}
	if (typeof media?.attributes?.url === "string") {
		const url = media.attributes.url;
		if (url.startsWith("http://") || url.startsWith("https://")) return url;
		return `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
	}
	return null;
}
function getStrapiMediaUrls(medias) {
	if (!medias) return [];
	if (Array.isArray(medias)) return medias.map((m) => getStrapiMediaUrl(m)).filter((u) => u !== null);
	if (medias?.data && Array.isArray(medias.data)) return medias.data.map((m) => getStrapiMediaUrl(m)).filter((u) => u !== null);
	const single = getStrapiMediaUrl(medias);
	return single ? [single] : [];
}
async function fetchStrapi(path, options = {}) {
	const { params, token, headers: extraHeaders, fetchOptions } = options;
	const query = params ? buildQuery(params) : "";
	const url = `${STRAPI_URL}/api${path.startsWith("/") ? path : `/${path}`}${query ? `?${query}` : ""}`;
	const headers = {
		Accept: "application/json",
		...extraHeaders
	};
	const authToken = token ?? STRAPI_TOKEN;
	if (authToken) headers.Authorization = `Bearer ${authToken}`;
	const res = await fetch(url, {
		headers,
		...fetchOptions
	});
	if (!res.ok) {
		let body = "";
		try {
			body = await res.text();
			const json2 = JSON.parse(body);
			body = JSON.stringify(json2).slice(0, 1e3);
		} catch {
			body = body.slice(0, 1e3);
		}
		throw new Error(`Strapi fetch failed: ${res.status} ${res.statusText} - ${body} (url: ${url})`);
	}
	return await res.json();
}
function unwrapStrapiEntity(entity) {
	if (!entity) return entity;
	if (entity.data !== void 0 && !entity.attributes && entity.id === void 0 && entity.documentId === void 0) return unwrapStrapiEntity(entity.data);
	if (entity.attributes && typeof entity.attributes === "object") {
		const { attributes, ...rest } = entity;
		return {
			...rest,
			...attributes
		};
	}
	return entity;
}
//#endregion
//#region src/components/SEO.astro
createAstro("https://diamante-nu.vercel.app");
var $$SEO = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$SEO;
	const { title: titleProp, description: descProp, seo, canonical: canonicalProp, image: imageProp, noIndex: noIndexProp, keywords: keywordsProp, siteName = "IE El Diamante" } = Astro.props;
	const title = seo?.metaTitle?.trim() || titleProp?.trim() || "IE El Diamante — Institución Educativa El Diamante";
	const description = (seo?.metaDescription?.trim() || descProp?.trim() || "Institución Educativa El Diamante, Santiago de Cali. Educación media técnica, convivencia y formación integral.").slice(0, 160);
	const keywords = seo?.keywords?.trim() || keywordsProp?.trim() || null;
	const canonical = seo?.canonicalURL?.trim() || canonicalProp?.trim() || null;
	const shouldNoIndex = seo?.noIndex ?? noIndexProp ?? false;
	let ogImage = null;
	if (imageProp) ogImage = imageProp;
	else if (seo?.metaImage) ogImage = getStrapiMediaUrl(seo.metaImage);
	const computedCanonical = canonical ?? (Astro.url ? Astro.url.href : null);
	const siteUrl = Astro.site?.toString() ?? (Astro.url ? `${Astro.url.protocol}//${Astro.url.host}` : void 0);
	return renderTemplate`<title>${title}</title><meta name="description"${addAttribute(description, "content")}>${keywords && renderTemplate`<meta name="keywords"${addAttribute(keywords, "content")}>`}${shouldNoIndex ? renderTemplate`<meta name="robots" content="noindex, nofollow">` : renderTemplate`<meta name="robots" content="index, follow">`}${computedCanonical && renderTemplate`<link rel="canonical"${addAttribute(computedCanonical, "href")}>`}<!-- Open Graph --><meta property="og:type" content="website"><meta property="og:site_name"${addAttribute(siteName, "content")}><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}>${computedCanonical && renderTemplate`<meta property="og:url"${addAttribute(computedCanonical, "content")}>`}${ogImage && renderTemplate`<meta property="og:image"${addAttribute(ogImage, "content")}>`}${ogImage && renderTemplate`<meta property="og:image:alt"${addAttribute(title, "content")}>`}<!-- Twitter --><meta name="twitter:card"${addAttribute(ogImage ? "summary_large_image" : "summary", "content")}><meta name="twitter:title"${addAttribute(title, "content")}><meta name="twitter:description"${addAttribute(description, "content")}>${ogImage && renderTemplate`<meta name="twitter:image"${addAttribute(ogImage, "content")}>`}<!-- Favicon fallback handled in Layout; additional SEO tags --><meta name="generator"${addAttribute(Astro.generator, "content")}><!-- JSON-LD: EducationalOrganization --><script type="application/ld+json">${unescapeHTML(JSON.stringify({
		"@context": "https://schema.org",
		"@type": "EducationalOrganization",
		"name": "Institución Educativa El Diamante",
		"url": siteUrl,
		"logo": `${siteUrl}/favicon.svg`,
		"description": "Institución Educativa El Diamante, Santiago de Cali. Educación media técnica, convivencia y formación integral.",
		"address": {
			"@type": "PostalAddress",
			"addressLocality": "Santiago de Cali",
			"addressRegion": "Valle del Cauca",
			"addressCountry": "CO"
		},
		"geo": {
			"@type": "GeoCoordinates",
			"latitude": "3.4372",
			"longitude": "-76.5225"
		},
		"sameAs": []
	}))}<\/script>`;
}, "/home/juniorxf/proyectos/diamante/web/src/components/SEO.astro", void 0);
//#endregion
//#region src/layouts/Layout.astro
createAstro("https://diamante-nu.vercel.app");
var $$Layout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Layout;
	const { title = "IE El Diamante — Institución Educativa El Diamante", description = "Institución Educativa El Diamante, Santiago de Cali. Educación media técnica, convivencia y formación integral.", seo = null, canonical = null, image = null, noIndex = false, keywords = null } = Astro.props;
	const effectiveTitle = seo?.metaTitle || title;
	const effectiveDescription = seo?.metaDescription || description;
	return renderTemplate`<html lang="es" data-astro-cid-ju4pidww><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" href="/favicon.ico">${renderComponent($$result, "SEO", $$SEO, {
		"title": effectiveTitle,
		"description": effectiveDescription,
		"seo": seo,
		"canonical": canonical,
		"image": image,
		"noIndex": noIndex,
		"keywords": keywords,
		"data-astro-cid-ju4pidww": true
	})}${renderHead($$result)}</head><body data-astro-cid-ju4pidww>${renderSlot($$result, $$slots["default"])}</body></html>`;
}, "/home/juniorxf/proyectos/diamante/web/src/layouts/Layout.astro", void 0);
var header_module_default = {
	header: "_header_1k1iq_3",
	topbar: "_topbar_1k1iq_17",
	topbarInner: "_topbarInner_1k1iq_23",
	topbarLabel: "_topbarLabel_1k1iq_34",
	topbarLinks: "_topbarLinks_1k1iq_44",
	mainbar: "_mainbar_1k1iq_74",
	mainbarInner: "_mainbarInner_1k1iq_78",
	brand: "_brand_1k1iq_88",
	logo: "_logo_1k1iq_95",
	name: "_name_1k1iq_101",
	nam1: "_nam1_1k1iq_102",
	nav: "_nav_1k1iq_125",
	link: "_link_1k1iq_133",
	subLink: "_subLink_1k1iq_152",
	cta: "_cta_1k1iq_153",
	menuButton: "_menuButton_1k1iq_154",
	dropdown: "_dropdown_1k1iq_166",
	menu: "_menu_1k1iq_154",
	actions: "_actions_1k1iq_212",
	iconClose: "_iconClose_1k1iq_253",
	iconOpen: "_iconOpen_1k1iq_261"
};
//#endregion
//#region src/services/configuracion.service.ts
var FALLBACK = {
	nombreInstitucion: "Institución Educativa El Diamante",
	emailInstitucional: "ie.eldiamante@cali.edu.co",
	telefonoPrincipal: "602 4260678",
	direccionPrincipal: "Carrera 33 N° 41-00, barrio El Diamante, Cali",
	horarioAtencion: "<p>Lunes a viernes 7:00 - 15:00. Sedes: El Diamante, Juan Pablo II, Señor de los Milagros.</p>",
	enlacesGobierno: [
		{
			label: "Transparencia",
			url: "https://transparencia.cali.gov.co/",
			externo: true,
			abrirEnNuevaPestana: true
		},
		{
			label: "Alcaldía de Cali",
			url: "https://www.cali.gov.co/",
			externo: true,
			abrirEnNuevaPestana: true
		},
		{
			label: "Secretaría de Educación",
			url: "https://www.cali.gov.co/educacion/",
			externo: true,
			abrirEnNuevaPestana: true
		}
	],
	redesSociales: [],
	avisoLegalFooter: "© 2026 Institución Educativa El Diamante · Santiago de Cali",
	seoDefault: null,
	escudoUrl: null,
	faviconUrl: null
};
function mapStrapiConfigToLegacy(raw) {
	const d = unwrapStrapiEntity(raw);
	if (!d) return FALLBACK;
	const escudoUrl = getStrapiMediaUrl(d.escudo);
	const faviconUrl = getStrapiMediaUrl(d.favicon);
	const seoDefault = d.seoDefault ?? d.seo ?? null;
	let seo = null;
	if (seoDefault) {
		seo = unwrapStrapiEntity(seoDefault);
		if (seo?.metaImage) {}
	}
	return {
		nombreInstitucion: d.nombreInstitucion ?? FALLBACK.nombreInstitucion,
		emailInstitucional: d.emailInstitucional ?? FALLBACK.emailInstitucional,
		telefonoPrincipal: d.telefonoPrincipal ?? FALLBACK.telefonoPrincipal,
		direccionPrincipal: d.direccionPrincipal ?? FALLBACK.direccionPrincipal,
		horarioAtencion: d.horarioAtencion ?? FALLBACK.horarioAtencion,
		enlacesGobierno: Array.isArray(d.enlacesGobierno) ? d.enlacesGobierno.map((e) => unwrapStrapiEntity(e)) : FALLBACK.enlacesGobierno,
		redesSociales: Array.isArray(d.redesSociales) ? d.redesSociales.map((e) => unwrapStrapiEntity(e)) : [],
		avisoLegalFooter: d.avisoLegalFooter ?? FALLBACK.avisoLegalFooter,
		seoDefault: seo,
		escudoUrl,
		faviconUrl
	};
}
var configuracionService = {
	fallback: FALLBACK,
	async getConfiguracion() {
		try {
			const res = await fetchStrapi("/configuracion-general", { params: {
				populate: {
					escudo: { fields: [
						"url",
						"width",
						"height"
					] },
					favicon: { fields: [
						"url",
						"width",
						"height"
					] },
					enlacesGobierno: { populate: "*" },
					redesSociales: { populate: "*" },
					seoDefault: { populate: { metaImage: { fields: [
						"url",
						"width",
						"height"
					] } } }
				},
				status: "published"
			} });
			const data = res.data ?? res;
			const unwrapped = data?.data ?? data;
			if (!unwrapped || typeof unwrapped === "object" && Object.keys(unwrapped).length === 0) return FALLBACK;
			const mapped = mapStrapiConfigToLegacy(unwrapped);
			if (!mapped.emailInstitucional) return FALLBACK;
			return mapped;
		} catch (err) {
			console.warn("[configuracionService.getConfiguracion] fallback:", err);
			return FALLBACK;
		}
	}
};
//#endregion
//#region src/components/Header.astro
var $$Header = createComponent(async ($$result, $$props, $$slots) => {
	let dinamicosEnlacesGobierno = null;
	try {
		const cfg = await configuracionService.getConfiguracion();
		if (cfg.enlacesGobierno && cfg.enlacesGobierno.length > 0) dinamicosEnlacesGobierno = cfg.enlacesGobierno.map((e) => ({
			label: e.label,
			href: e.url,
			external: e.externo || e.abrirEnNuevaPestana
		}));
	} catch {}
	const nav = [
		{
			label: "Inicio",
			href: "/"
		},
		{
			label: "Identidad",
			href: "/#identidad",
			children: [
				{
					label: "Inscripciones Abiertas",
					href: "/inscripciones-abiertas"
				},
				{
					label: "Misión",
					href: "/mision"
				},
				{
					label: "Visión",
					href: "/vision"
				},
				{
					label: "Valores Institucionales",
					href: "/valores-institucionales"
				},
				{
					label: "Manual de Convivencia",
					href: "/manual-convivencia"
				},
				{
					label: "Organigrama",
					href: "/organigrama"
				},
				{
					label: "P.E.I.",
					href: "/pei"
				},
				{
					label: "A Qué Vamos al Colegio",
					href: "/a-que-vamos-al-colegio"
				},
				{
					label: "Proyecto Ambiental",
					href: "/proyecto-ambiental"
				},
				{
					label: "Nuestras Sedes",
					href: "/sedes"
				}
			]
		},
		{
			label: "Sedes",
			href: "/#sedes"
		},
		{
			label: "Especialidades",
			href: "/#especialidades"
		},
		{
			label: "Noticias",
			href: "/#noticias"
		},
		{
			label: "Servicios",
			href: "/contacto",
			children: [
				{
					label: "Canales de Atención",
					href: "/canales-de-atencion"
				},
				{
					label: "Contáctanos",
					href: "/contacto"
				},
				{
					label: "Directorio",
					href: "/directorio"
				},
				{
					label: "Peticiones, Quejas y Reclamos",
					href: "/peticiones-quejas-y-reclamos"
				},
				{
					label: "Denuncias de Corrupción",
					href: "/denuncias-hechos-de-corrupcion"
				}
			]
		},
		{
			label: "Contratación",
			href: "/contratacion",
			children: [{
				label: "Invitaciones",
				href: "/contratacion"
			}, {
				label: "Resolución de Matrícula",
				href: "/resolucion-proceso-de-matricula"
			}]
		},
		{
			label: "Organismo",
			href: dinamicosEnlacesGobierno?.[0]?.href ?? "https://www.cali.gov.co/educacion/",
			children: dinamicosEnlacesGobierno ?? [
				{
					label: "Educación",
					href: "https://www.cali.gov.co/educacion/"
				},
				{
					label: "Deporte y Recreación",
					href: "https://www.cali.gov.co/deporte/"
				},
				{
					label: "Paz y Cultura Ciudadana",
					href: "https://www.cali.gov.co/pazycultura/"
				},
				{
					label: "Bienestar Social",
					href: "https://www.cali.gov.co/bienestar/"
				}
			]
		}
	];
	return renderTemplate`${maybeRenderHead($$result)}<header id="site-header"${addAttribute(header_module_default.header, "class")} data-scrolled="false" data-open="false"><div${addAttribute(header_module_default.mainbar, "class")}><div${addAttribute(header_module_default.mainbarInner, "class")}><a href="/"${addAttribute(header_module_default.brand, "class")} aria-label="Institución Educativa El Diamante - inicio"><img${addAttribute(header_module_default.logo, "class")} src="/logo_diamante.png" alt="Escudo de la Institución Educativa El Diamante" width="56" height="56"><span${addAttribute(header_module_default.name, "class")}>Institucion Educativa <br> El Diamante</span><span${addAttribute(header_module_default.nam1, "class")}>Institucion Educativa El Diamante</span>  </a><nav${addAttribute(header_module_default.nav, "class")} aria-label="Navegación principal">${nav.map((item) => item.children ? renderTemplate`<div${addAttribute(header_module_default.dropdown, "class")}><button type="button"${addAttribute(header_module_default.link, "class")} aria-haspopup="true" aria-expanded="false">${item.label}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button><div${addAttribute(header_module_default.menu, "class")} role="menu">${item.children.map((sub) => {
		const isExternal = sub.external || sub.href.startsWith("http");
		return renderTemplate`<a${addAttribute(sub.href, "href")} role="menuitem"${addAttribute(header_module_default.subLink, "class")}${addAttribute(isExternal ? "_blank" : void 0, "target")}${addAttribute(isExternal ? "noopener noreferrer" : void 0, "rel")}>${sub.label}</a>`;
	})}</div></div>` : renderTemplate`<a${addAttribute(header_module_default.link, "class")}${addAttribute(item.href, "href")}>${item.label}</a>`)}</nav><div${addAttribute(header_module_default.actions, "class")}><button id="menu-button"${addAttribute(header_module_default.menuButton, "class")} type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="site-header"><svg${addAttribute(header_module_default.iconOpen, "class")} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg><svg${addAttribute(header_module_default.iconClose, "class")} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg></button></div></div></div></header>${renderScript($$result, "/home/juniorxf/proyectos/diamante/web/src/components/Header.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/juniorxf/proyectos/diamante/web/src/components/Header.astro", void 0);
//#endregion
//#region src/data/sedes.ts
var sedes_exports = /* @__PURE__ */ __exportAll({ sedes: () => sedes });
var sedes = [
	{
		slug: "el-diamante",
		nombre: "Sede El Diamante (Principal)",
		barrio: "El Diamante",
		direccion: "Carrera 33 N° 41-00, Cali, Colombia",
		telefono: "602 4260678",
		email: "ie.eldiamante@cali.edu.co",
		mapQuery: "Carrera 33 #41-00, El Diamante, Cali, Colombia",
		imgPath: "/sedes/sede_principal.png",
		bannerUrl: "https://www.ie-eldiamantecali.edu.co/wp-content/uploads/2024/09/2-1024x373.png"
	},
	{
		slug: "juan-pablo-ii",
		nombre: "Sede Juan Pablo II",
		barrio: "El Vergel",
		direccion: "Carrera 33 N° 42 C 09, Cali, Colombia",
		telefono: "602 4376986",
		email: "ie.eldiamante@cali.edu.co",
		mapQuery: "Carrera 33 #42C-09, El Vergel, Cali, Colombia",
		imgPath: "/sedes/sede_juan_pablo.png",
		bannerUrl: "https://www.ie-eldiamantecali.edu.co/wp-content/uploads/2024/09/3-1024x373.png"
	},
	{
		slug: "senor-de-los-milagros",
		nombre: "Sede Señor de los Milagros",
		barrio: "El Retiro",
		direccion: "Carrera 38 No. 51 A 02, El Retiro, Cali, Colombia",
		telefono: "302 543 3862",
		email: "ie.eldiamante@cali.edu.co",
		mapQuery: "Carrera 38 #51A-02, El Retiro, Cali, Colombia",
		imgPath: "/sedes/sede_retiro.png",
		bannerUrl: "https://www.ie-eldiamantecali.edu.co/wp-content/uploads/2024/09/I.E.-El-Diamante-Cali-1920-x-700-px-3-1024x373.png"
	}
];
//#endregion
//#region src/lib/data-source.ts
var DATA_SOURCE_ATTR = "_source";
/**
* Adjunta la marca de origen a un array u objeto sin romper su forma.
* El valor sigue siendo el mismo array/objeto (backward compatible),
* solo añade una prop no enumerable `_source`.
*/
function attachSource(data, source) {
	if (data === null || data === void 0) return data;
	try {
		Object.defineProperty(data, DATA_SOURCE_ATTR, {
			value: source,
			enumerable: false,
			writable: true,
			configurable: true
		});
	} catch {
		try {
			data[DATA_SOURCE_ATTR] = source;
		} catch {}
	}
	return data;
}
/** Lee la marca de origen. Si no hay marca, asume 'fallback' (seguro). */
function readSource(data, fallback = "fallback") {
	if (!data) return fallback;
	const s = data?.[DATA_SOURCE_ATTR];
	if (s === "strapi" || s === "fallback") return s;
	return fallback;
}
//#endregion
//#region src/lib/mappers.ts
/**
* Mappers: convierten respuestas Strapi (flat, con relaciones populadas) a tipos legacy
* usados en páginas y componentes (Noticia, Sede, Especialidad, etc.).
*
* Compatibilidad: Soporta tanto Strapi 5 flat como Strapi 4 attributes wrapper
* mediante unwrapStrapiEntity.
*/
function stripHtml(html) {
	if (!html) return "";
	return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function formatFechaStrapi(iso) {
	if (!iso) return "";
	const d = new Date(iso);
	if (isNaN(d.getTime())) return iso;
	if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
		const [y, m, day] = iso.split("-").map(Number);
		const utc = new Date(Date.UTC(y, m - 1, day, 12));
		try {
			return new Intl.DateTimeFormat("es-CO", {
				day: "numeric",
				month: "long",
				year: "numeric",
				timeZone: "UTC"
			}).format(utc);
		} catch {
			return `${day} de ${utc.toLocaleString("es", { month: "long" })} de ${y}`;
		}
	}
	try {
		return new Intl.DateTimeFormat("es-CO", {
			day: "numeric",
			month: "long",
			year: "numeric"
		}).format(d);
	} catch {
		return iso;
	}
}
function slugify(input) {
	return input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function unwrapRelation(maybe) {
	if (!maybe) return null;
	if (maybe.data) return unwrapStrapiEntity(maybe.data);
	return unwrapStrapiEntity(maybe);
}
function mapStrapiNoticiaToNoticia(raw) {
	const d = unwrapStrapiEntity(raw);
	const cat = unwrapRelation(d.categoria);
	const categoriaNombre = cat?.nombre ?? (typeof d.categoria === "string" ? d.categoria : null) ?? "Institucional";
	const categoriaSlug = cat?.slug ?? (typeof d.categoria === "string" ? slugify(d.categoria) : null) ?? null;
	const fechaRaw = d.fechaPublicacion ?? d.fecha ?? null;
	const fecha = fechaRaw ? formatFechaStrapi(fechaRaw) : "";
	const portadaUrl = getStrapiMediaUrl(d.portada ?? d.imagen ?? null);
	const galeriaRaw = d.galeria ?? null;
	let galeriaUrls = [];
	if (galeriaRaw) {
		if (Array.isArray(galeriaRaw)) galeriaUrls = galeriaRaw.map((m) => getStrapiMediaUrl(m)).filter((u) => !!u);
		else if (galeriaRaw.data && Array.isArray(galeriaRaw.data)) galeriaUrls = galeriaRaw.data.map((m) => getStrapiMediaUrl(m)).filter((u) => !!u);
		else {
			const single = getStrapiMediaUrl(galeriaRaw);
			if (single) galeriaUrls = [single];
		}
	}
	return {
		slug: d.slug ?? slugify(d.titulo ?? ""),
		titulo: d.titulo ?? "",
		fecha,
		categoria: categoriaNombre,
		resumen: d.resumen ?? stripHtml(d.contenido ?? "").slice(0, 280),
		contenido: d.contenido ?? "",
		portadaUrl: portadaUrl ?? null,
		galeriaUrls,
		destacada: !!d.destacada,
		fechaRaw,
		categoriaSlug
	};
}
function legacySedeImgFallback(slug) {
	return {
		"el-diamante": "/sedes/sede_principal.png",
		"juan-pablo-ii": "/sedes/sede_juan_pablo.png",
		"senor-de-los-milagros": "/sedes/sede_retiro.png"
	}[slug] ?? `/sedes/${slug}.png`;
}
function mapStrapiSedeToSede(raw) {
	const d = unwrapStrapiEntity(raw);
	const imagenCardUrl = getStrapiMediaUrl(d.imagenCard ?? d.imagen_card ?? d.imagen);
	const bannerUrl = getStrapiMediaUrl(d.banner);
	const imgPath = imagenCardUrl ?? d.imgPath ?? legacySedeImgFallback(d.slug);
	return {
		slug: d.slug,
		nombre: d.nombre,
		barrio: d.barrio ?? "",
		direccion: d.direccion ?? "",
		telefono: d.telefono ?? "",
		email: d.email ?? "ie.eldiamante@cali.edu.co",
		mapQuery: d.mapQuery ?? d.direccion ?? "",
		imgPath,
		bannerUrl: bannerUrl ?? d.bannerUrl ?? void 0,
		horarioAtencion: d.horarioAtencion ?? null,
		imagenCardUrl: imagenCardUrl ?? null
	};
}
function mapStrapiEspecialidadToEspecialidad(raw) {
	const d = unwrapStrapiEntity(raw);
	const puntosRaw = d.puntosDestacados ?? d.puntos ?? [];
	const puntos = Array.isArray(puntosRaw) ? puntosRaw.map((p) => {
		if (typeof p === "string") return p;
		if (p?.texto) return p.texto;
		if (p?.attributes?.texto) return p.attributes.texto;
		return String(p ?? "");
	}).filter(Boolean) : [];
	const imagenesRaw = d.imagenes ?? d.imagen ?? null;
	let images = [];
	if (imagenesRaw) {
		if (Array.isArray(imagenesRaw)) images = imagenesRaw.map((m) => getStrapiMediaUrl(m)).filter((u) => !!u);
		else if (imagenesRaw.data && Array.isArray(imagenesRaw.data)) images = imagenesRaw.data.map((m) => getStrapiMediaUrl(m)).filter((u) => !!u);
		else {
			const single = getStrapiMediaUrl(imagenesRaw);
			if (single) images = [single];
		}
	}
	if (images.length === 0) images = [`/tecnica/${d.slug}/${d.slug}_1.jpeg`];
	const planEstudioUrl = getStrapiMediaUrl(d.planEstudio ?? null);
	return {
		slug: d.slug,
		nombre: d.nombre,
		descripcion: d.descripcion ?? "",
		puntos,
		images,
		duracion: d.duracion ?? null,
		planEstudioUrl: planEstudioUrl ?? null,
		orden: d.orden ?? 0
	};
}
function mapStrapiGaleriaItemToLegacy(raw) {
	const d = unwrapStrapiEntity(raw);
	const categoriaNombre = unwrapRelation(d.categoria)?.nombre ?? (typeof d.categoria === "string" ? d.categoria : "General");
	const id = d.documentId ?? String(d.id ?? d.titulo);
	return {
		id: String(id),
		titulo: d.titulo,
		categoria: categoriaNombre
	};
}
function mapStrapiGaleriaItemToGalleryImage(raw) {
	const d = unwrapStrapiEntity(raw);
	const media = d.imagen ?? d.imagenCard ?? null;
	const src = getStrapiMediaUrl(media);
	if (!src) return null;
	let width = 800;
	let height = 600;
	const dims = unwrapStrapiEntity(media);
	if (dims?.width && dims?.height) {
		width = dims.width;
		height = dims.height;
	} else if (dims?.attributes?.width && dims?.attributes?.height) {
		width = dims.attributes.width;
		height = dims.attributes.height;
	} else if (media?.data?.attributes?.width) {
		width = media.data.attributes.width;
		height = media.data.attributes.height;
	}
	if (!width || !height) {
		width = 600;
		height = 800;
	}
	const id = d.documentId ?? String(d.id ?? src);
	const categoriaNombre = unwrapRelation(d.categoria)?.nombre ?? (typeof d.categoria === "string" ? d.categoria : void 0);
	return {
		id: String(id),
		src,
		width,
		height,
		alt: d.descripcion ?? d.titulo ?? "",
		href: "/galeria",
		titulo: d.titulo,
		categoria: categoriaNombre
	};
}
function mapStrapiGaleriaToGalleryImages(list) {
	if (!Array.isArray(list)) return [];
	return list.map(mapStrapiGaleriaItemToGalleryImage).filter((x) => x !== null);
}
//#endregion
//#region src/services/sedes.service.ts
var sedesService = {
	async getSedes() {
		try {
			const data = (await fetchStrapi("/sedes", { params: {
				populate: {
					imagenCard: { fields: [
						"url",
						"width",
						"height"
					] },
					banner: { fields: [
						"url",
						"width",
						"height"
					] }
				},
				sort: ["orden:asc", "nombre:asc"],
				pagination: { pageSize: 100 },
				status: "published"
			} })).data ?? [];
			if (!Array.isArray(data) || data.length === 0) return attachSource(sedes, "fallback");
			return attachSource(data.map(mapStrapiSedeToSede), "strapi");
		} catch (err) {
			console.warn("[sedesService.getSedes] Strapi falla, fallback:", err);
			return attachSource(sedes, "fallback");
		}
	},
	async getSedeBySlug(slug) {
		try {
			const data = (await fetchStrapi("/sedes", { params: {
				filters: { slug: { $eq: slug } },
				populate: {
					imagenCard: { fields: [
						"url",
						"width",
						"height"
					] },
					banner: { fields: [
						"url",
						"width",
						"height"
					] }
				},
				pagination: { pageSize: 1 },
				status: "published"
			} })).data ?? [];
			const raw = Array.isArray(data) ? data[0] : null;
			if (!raw) {
				const fb = sedes.find((s) => s.slug === slug);
				return fb ? attachSource(fb, "fallback") : void 0;
			}
			return attachSource(mapStrapiSedeToSede(raw), "strapi");
		} catch (err) {
			console.warn("[sedesService.getSedeBySlug] fallback:", err);
			const fb = sedes.find((s) => s.slug === slug);
			return fb ? attachSource(fb, "fallback") : void 0;
		}
	}
};
var footer_module_default = {
	footer: "_footer_sgi8j_3",
	container: "_container_sgi8j_8",
	grid: "_grid_sgi8j_14",
	column: "_column_sgi8j_20",
	heading: "_heading_sgi8j_26",
	name: "_name_sgi8j_39",
	text: "_text_sgi8j_47",
	link: "_link_sgi8j_54",
	list: "_list_sgi8j_75",
	listItem: "_listItem_sgi8j_84",
	sedeName: "_sedeName_sgi8j_90",
	bottomBar: "_bottomBar_sgi8j_96",
	bottomInner: "_bottomInner_sgi8j_100",
	legal: "_legal_sgi8j_106"
};
//#endregion
//#region src/components/Footer.astro
var $$Footer = createComponent(async ($$result, $$props, $$slots) => {
	const config = await configuracionService.getConfiguracion().catch(() => configuracionService.fallback);
	const sedes$1 = await sedesService.getSedes().catch(() => sedes);
	const enlacesGobierno = config.enlacesGobierno && config.enlacesGobierno.length > 0 ? config.enlacesGobierno : [
		{
			label: "Transparencia",
			url: "https://transparencia.cali.gov.co/",
			externo: true
		},
		{
			label: "Alcaldía de Cali",
			url: "https://www.cali.gov.co/",
			externo: true
		},
		{
			label: "Secretaría de Educación",
			url: "https://www.cali.gov.co/educacion/",
			externo: true
		}
	];
	const emailInstitucional = config.emailInstitucional ?? "ie.eldiamante@cali.edu.co";
	const avisoLegal = config.avisoLegalFooter ?? "© 2026 Institución Educativa El Diamante · Santiago de Cali";
	return renderTemplate`${maybeRenderHead($$result)}<footer id="contacto"${addAttribute(footer_module_default.footer, "class")}><div${addAttribute(footer_module_default.container, "class")}><div${addAttribute(footer_module_default.grid, "class")}><div${addAttribute(footer_module_default.column, "class")}><h2${addAttribute(footer_module_default.heading, "class")}>Instituci&oacute;n</h2><p${addAttribute(footer_module_default.name, "class")}>${config.nombreInstitucion}</p><p${addAttribute(footer_module_default.text, "class")}>${config.direccionPrincipal ?? "Santiago de Cali, Colombia"}</p><a${addAttribute(footer_module_default.link, "class")}${addAttribute(`mailto:${emailInstitucional}`, "href")}>${emailInstitucional}</a>${config.telefonoPrincipal && renderTemplate`<a${addAttribute(footer_module_default.link, "class")}${addAttribute(`tel:${config.telefonoPrincipal.replace(/\s+/g, "")}`, "href")}>${config.telefonoPrincipal}</a>`}${config.horarioAtencion && renderTemplate`<p${addAttribute(footer_module_default.text, "class")}>${unescapeHTML(config.horarioAtencion)}</p>`}<p${addAttribute(footer_module_default.text, "class")}>Rectoría Institucional</p></div><div${addAttribute(footer_module_default.column, "class")}><h2${addAttribute(footer_module_default.heading, "class")}>Sedes</h2><ul${addAttribute(footer_module_default.list, "class")}>${sedes$1.map((sede) => renderTemplate`<li${addAttribute(footer_module_default.listItem, "class")}><span${addAttribute(footer_module_default.sedeName, "class")}>${sede.nombre}</span><a${addAttribute(footer_module_default.link, "class")}${addAttribute(`tel:${sede.telefono.replace(/\s+/g, "")}`, "href")}>${sede.telefono}</a></li>`)}</ul></div><div${addAttribute(footer_module_default.column, "class")}><h2${addAttribute(footer_module_default.heading, "class")}>Gobierno</h2><ul${addAttribute(footer_module_default.list, "class")}>${enlacesGobierno.map((enlace) => {
		const isExternal = enlace.externo || enlace.abrirEnNuevaPestana || enlace.url.startsWith("http");
		return renderTemplate`<li${addAttribute(footer_module_default.listItem, "class")}><a${addAttribute(footer_module_default.link, "class")}${addAttribute(enlace.url, "href")}${addAttribute(isExternal ? "_blank" : void 0, "target")}${addAttribute(isExternal ? "noopener noreferrer" : void 0, "rel")}>${enlace.label}</a></li>`;
	})}</ul></div></div></div><div${addAttribute(footer_module_default.bottomBar, "class")}><div${addAttribute(footer_module_default.bottomInner, "class")}><p${addAttribute(footer_module_default.legal, "class")}>${avisoLegal}</p></div></div></footer>`;
}, "/home/juniorxf/proyectos/diamante/web/src/components/Footer.astro", void 0);
//#endregion
//#region src/components/PageHero.astro
createAstro("https://diamante-nu.vercel.app");
var $$PageHero = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$PageHero;
	const { kicker, title, crumbs } = Astro.props;
	const autoCrumbs = (() => {
		if (crumbs && crumbs.length > 0) return crumbs;
		const list = [];
		const k = kicker?.trim();
		const t = title?.trim();
		if (k && t && k.toLowerCase() !== t.toLowerCase()) list.push({ label: k });
		if (t) list.push({ label: t });
		return list;
	})();
	autoCrumbs.length;
	return renderTemplate`${maybeRenderHead($$result)}<section class="page-hero" data-astro-cid-75ysl5lo><div class="page-hero__inner" data-astro-cid-75ysl5lo><nav class="page-hero__breadcrumb" aria-label="Miga de pan" data-astro-cid-75ysl5lo><a href="/" class="page-hero__link" data-astro-cid-75ysl5lo>Inicio</a>${autoCrumbs.map((c) => renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`<span class="page-hero__sep" aria-hidden="true" data-astro-cid-75ysl5lo>/</span>${c.href ? renderTemplate`<a${addAttribute(c.href, "href")} class="page-hero__link" data-astro-cid-75ysl5lo>${c.label}</a>` : renderTemplate`<span class="page-hero__current"${addAttribute(c === autoCrumbs[autoCrumbs.length - 1] ? "page" : void 0, "aria-current")} data-astro-cid-75ysl5lo>${c.label}</span>`}` })}`)}</nav><h1 class="page-hero__title" data-astro-cid-75ysl5lo>${title}</h1></div></section>`;
}, "/home/juniorxf/proyectos/diamante/web/src/components/PageHero.astro", void 0);
//#endregion
export { mapStrapiGaleriaItemToLegacy as a, attachSource as c, $$Header as d, $$Layout as f, getStrapiMediaUrls as h, mapStrapiEspecialidadToEspecialidad as i, readSource as l, getStrapiMediaUrl as m, $$Footer as n, mapStrapiGaleriaToGalleryImages as o, fetchStrapi as p, sedesService as r, mapStrapiNoticiaToNoticia as s, $$PageHero as t, sedes_exports as u };
