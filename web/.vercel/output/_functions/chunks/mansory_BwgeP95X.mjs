import { jsx } from "react/jsx-runtime";
var galeria_module_default = {
	section: "_section_13dg9_1",
	inner: "_inner_13dg9_9",
	link: "_link_13dg9_17",
	kicker: "_kicker_13dg9_23",
	title: "_title_13dg9_33",
	rule: "_rule_13dg9_41",
	marquee: "_marquee_13dg9_49",
	track: "_track_13dg9_58",
	"scroll-left": "_scroll-left_13dg9_1",
	trackB: "_trackB_13dg9_65",
	card: "_card_13dg9_76",
	shot: "_shot_13dg9_117",
	ph: "_ph_13dg9_127",
	shimmer: "_shimmer_13dg9_1",
	masonry: "_masonry_13dg9_142",
	masonryColumn: "_masonryColumn_13dg9_149",
	mItem: "_mItem_13dg9_156"
};
//#endregion
//#region src/components/mansory.tsx
function normalizeFoto(input, idx) {
	if (!input) return null;
	if (typeof input === "string") {
		const src = input.trim();
		if (!src) return null;
		return {
			id: `mansory-${idx}-${src}`,
			src,
			width: 800,
			height: 600,
			alt: "",
			href: src
		};
	}
	const src = input?.src;
	if (typeof src !== "string" || !src.trim()) return null;
	const w = Number(input.width);
	const h = Number(input.height);
	const width = Number.isFinite(w) && w > 0 ? w : 800;
	const height = Number.isFinite(h) && h > 0 ? h : 600;
	return {
		id: input.id ?? `${src}-${idx}`,
		src: src.trim(),
		width,
		height,
		alt: input.alt ?? "",
		href: input.href ?? src.trim(),
		titulo: input.titulo,
		categoria: input.categoria
	};
}
function Masonry({ fotos }) {
	const normalized = (Array.isArray(fotos) ? fotos : []).map((f, i) => normalizeFoto(f, i)).filter((x) => x !== null);
	if (normalized.length === 0) return null;
	const columns = [
		[],
		[],
		[]
	];
	const heights = [
		0,
		0,
		0
	];
	normalized.forEach((foto) => {
		const ratios = heights.map((h) => Number.isFinite(h) ? h : 0);
		const min = Math.min(...ratios);
		let shortestColumn = heights.indexOf(min);
		if (shortestColumn < 0 || shortestColumn >= columns.length) shortestColumn = 0;
		columns[shortestColumn].push(foto);
		const ratio = foto.height / foto.width;
		heights[shortestColumn] += Number.isFinite(ratio) && ratio > 0 ? ratio : .75;
	});
	return /* @__PURE__ */ jsx("div", {
		className: galeria_module_default.masonry,
		children: columns.map((column, columnIndex) => /* @__PURE__ */ jsx("div", {
			className: galeria_module_default.masonryColumn,
			children: column.map((foto) => /* @__PURE__ */ jsx("a", {
				className: galeria_module_default.mItem,
				href: foto.href ?? foto.src,
				target: "_blank",
				rel: "noopener noreferrer",
				"aria-label": "Abrir fotografía en tamaño completo",
				children: /* @__PURE__ */ jsx("img", {
					src: foto.src,
					width: foto.width,
					height: foto.height,
					alt: foto.alt ?? "",
					loading: "lazy",
					decoding: "async"
				})
			}, foto.id ?? foto.src))
		}, columnIndex))
	});
}
//#endregion
export { Masonry as t };
