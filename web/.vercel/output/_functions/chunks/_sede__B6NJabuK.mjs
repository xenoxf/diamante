import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { C as createAstro, a as Fragment, d as renderTemplate, f as maybeRenderHead, i as renderComponent, m as addAttribute } from "./server_Cw-A2kAj.mjs";
import { t as createComponent } from "./compiler_BI4hSaVN.mjs";
import { d as $$Header, f as $$Layout, m as getStrapiMediaUrl, n as $$Footer, r as sedesService, t as $$PageHero } from "./page_Cfa7tUOu.mjs";
import { t as setISRHeaders } from "./isr_DLUhkWmb.mjs";
//#region src/pages/sedes/[sede].astro
var _sede__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Sede,
	file: () => $$file,
	getStaticPaths: () => getStaticPaths,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://diamante-nu.vercel.app");
async function getStaticPaths() {
	try {
		return (await sedesService.getSedes()).map((s) => ({
			params: { sede: s.slug },
			props: { sede: s }
		}));
	} catch (err) {
		console.warn("[sedes/[sede] getStaticPaths] fallback:", err);
		const { sedes: fallback } = await import("./page_Cfa7tUOu.mjs").then((n) => n.u);
		return fallback.map((s) => ({
			params: { sede: s.slug },
			props: { sede: s }
		}));
	}
}
var $$Sede = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Sede;
	setISRHeaders(Astro.response, { sMaxAge: 300 });
	let sede = Astro.props?.sede;
	const slugParam = Astro.params.sede;
	if (!sede || sede.slug !== slugParam) try {
		const fetched = await sedesService.getSedeBySlug(String(slugParam));
		if (fetched) sede = fetched;
	} catch (err) {
		console.warn("[sedes/[sede]] getSedeBySlug fallback:", err);
	}
	if (!sede) {}
	const imagenCardUrl = sede?.imagenCardUrl ?? getStrapiMediaUrl(sede?.imagenCard) ?? sede?.imgPath ?? null;
	const bannerUrl = sede?.bannerUrl ?? getStrapiMediaUrl(sede?.banner) ?? null;
	const mapQueryRaw = sede?.mapQuery ?? sede?.direccion ?? "";
	const mapSrc = mapQueryRaw ? `https://www.google.com/maps?q=${encodeURIComponent(mapQueryRaw)}&output=embed` : "";
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Header", $$Header, {})}${maybeRenderHead($$result)}<main class="page">${sede ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "PageHero", $$PageHero, {
		"kicker": "Nuestras sedes",
		"title": sede.nombre
	})}<div class="container">${bannerUrl && renderTemplate`<p><img class="figure-img"${addAttribute(bannerUrl, "src")}${addAttribute(`Banner de ${sede.nombre}`, "alt")} loading="lazy" decoding="async"></p>`}${imagenCardUrl && imagenCardUrl !== bannerUrl && renderTemplate`<p><img class="figure-img"${addAttribute(imagenCardUrl, "src")}${addAttribute(`Imagen de ${sede.nombre}`, "alt")} loading="lazy" decoding="async"></p>`}<div class="data"><div><h4>Barrio</h4><p>${sede.barrio}</p></div><div><h4>Dirección</h4><p>${sede.direccion}</p></div><div><h4>Teléfono</h4><p><a${addAttribute(`tel:${sede.telefono}`, "href")}>${sede.telefono}</a></p></div><div><h4>Correo</h4><p><a${addAttribute(`mailto:${sede.email}`, "href")}>${sede.email}</a></p></div><div><h4>Mapa</h4><p>${sede.mapQuery}</p></div>${sede.horarioAtencion && renderTemplate`<div><h4>Horario de atención</h4><p>${sede.horarioAtencion}</p></div>`}${imagenCardUrl && renderTemplate`<div><h4>Imagen Card</h4><p class="meta" style="word-break:break-all;">${imagenCardUrl}</p></div>`}${bannerUrl && renderTemplate`<div><h4>Banner</h4><p class="meta" style="word-break:break-all;">${bannerUrl}</p></div>`}</div><h2>Ubicación</h2>${mapSrc ? renderTemplate`<iframe class="map"${addAttribute(`Mapa de ubicación de ${sede.nombre}`, "title")}${addAttribute(mapSrc, "src")} loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>` : renderTemplate`<p class="meta">Mapa no disponible para esta sede.</p>`}<p class="back"><a href="/sedes">Volver a todas las sedes</a></p></div>` })}` : renderTemplate`<div class="container"><h1>Sede no encontrada</h1><p>La sede solicitada no existe.</p><p class="back"><a href="/sedes">Volver a todas las sedes</a></p></div>`}</main>${renderComponent($$result, "Footer", $$Footer, {})}` })}`;
}, "/home/juniorxf/proyectos/diamante/web/src/pages/sedes/[sede].astro", void 0);
var $$file = "/home/juniorxf/proyectos/diamante/web/src/pages/sedes/[sede].astro";
var $$url = "/sedes/[sede]";
//#endregion
//#region \0virtual:astro:page:src/pages/sedes/[sede]@_@astro
var page = () => _sede__exports;
//#endregion
export { page };
