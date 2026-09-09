import { C as createAstro, d as renderTemplate, f as maybeRenderHead, m as addAttribute, t as spreadAttributes } from "./server_Cw-A2kAj.mjs";
import { t as createComponent } from "./compiler_BI4hSaVN.mjs";
//#region src/components/DataSourceBadge.astro
createAstro("https://diamante-nu.vercel.app");
var $$DataSourceBadge = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$DataSourceBadge;
	const { source = "fallback", id } = Astro.props;
	const isLive = source === "strapi";
	const label = isLive ? "Strapi en vivo" : "Fallback local · Strapi no disponible";
	const title = isLive ? "Datos cargados desde Strapi (API REST)" : "Strapi no respondió o no tiene datos: se muestran datos locales de respaldo";
	return renderTemplate`${maybeRenderHead($$result)}<span${addAttribute(["ds-badge", isLive ? "ds-badge--live" : "ds-badge--fallback"], "class:list")}${addAttribute(title, "title")}${addAttribute(source, "data-source")}${spreadAttributes(id ? { id } : {})} role="status"${addAttribute(`Origen de datos: ${label}`, "aria-label")} data-astro-cid-t4t4lfjl><span class="ds-dot" aria-hidden="true" data-astro-cid-t4t4lfjl></span>${label}</span>`;
}, "/home/juniorxf/proyectos/diamante/web/src/components/DataSourceBadge.astro", void 0);
//#endregion
export { $$DataSourceBadge as t };
