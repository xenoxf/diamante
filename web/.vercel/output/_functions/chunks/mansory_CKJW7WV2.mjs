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
function Masonry({ fotos }) {
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
	fotos.forEach((foto) => {
		const shortestColumn = heights.indexOf(Math.min(...heights));
		columns[shortestColumn].push(foto);
		heights[shortestColumn] += foto.height / foto.width;
	});
	return /* @__PURE__ */ jsx("div", {
		className: galeria_module_default.masonry,
		children: columns.map((column, columnIndex) => /* @__PURE__ */ jsx("div", {
			className: galeria_module_default.masonryColumn,
			children: column.map((foto) => /* @__PURE__ */ jsx("a", {
				className: galeria_module_default.mItem,
				href: foto.src,
				target: "_blank",
				rel: "noopener noreferrer",
				"aria-label": "Abrir fotografía en tamaño completo",
				children: /* @__PURE__ */ jsx("img", {
					src: foto.src,
					width: foto.width,
					height: foto.height,
					alt: "",
					loading: "lazy",
					decoding: "async"
				})
			}, foto.src))
		}, columnIndex))
	});
}
//#endregion
export { Masonry as t };
