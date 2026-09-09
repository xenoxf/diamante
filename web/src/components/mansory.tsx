import type { GalleryImage } from "../types";
import styles from "../styles/galeria.module.css";

interface MasonryProps {
  fotos: GalleryImage[];
}

function normalizeFoto(input: GalleryImage | string, idx: number): GalleryImage | null {
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
      href: src,
    };
  }
  const src = (input as any)?.src;
  if (typeof src !== "string" || !src.trim()) return null;
  const w = Number((input as any).width);
  const h = Number((input as any).height);
  const width = Number.isFinite(w) && w > 0 ? w : 800;
  const height = Number.isFinite(h) && h > 0 ? h : 600;
  return {
    id: (input as any).id ?? `${src}-${idx}`,
    src: src.trim(),
    width,
    height,
    alt: (input as any).alt ?? "",
    href: (input as any).href ?? src.trim(),
    titulo: (input as any).titulo,
    categoria: (input as any).categoria,
  };
}

export default function Masonry({ fotos }: MasonryProps) {
  const normalized = (Array.isArray(fotos) ? fotos : [])
    .map((f, i) => normalizeFoto(f as any, i))
    .filter((x): x is GalleryImage => x !== null);

  if (normalized.length === 0) return null;

  const columns: GalleryImage[][] = [[], [], []];
  const heights = [0, 0, 0];

  normalized.forEach((foto) => {
    const ratios = heights.map((h) => (Number.isFinite(h) ? h : 0));
    const min = Math.min(...ratios);
    let shortestColumn = heights.indexOf(min);
    if (shortestColumn < 0 || shortestColumn >= columns.length) shortestColumn = 0;

    columns[shortestColumn]!.push(foto);

    const ratio = foto.height / foto.width;
    heights[shortestColumn] += Number.isFinite(ratio) && ratio > 0 ? ratio : 0.75;
  });

  return (
    <div className={styles.masonry}>
      {columns.map((column, columnIndex) => (
        <div className={styles.masonryColumn} key={columnIndex}>
          {column.map((foto) => (
            <a
              key={foto.id ?? foto.src}
              className={styles.mItem}
              href={foto.href ?? foto.src}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir fotografía en tamaño completo"
            >
              <img
                src={foto.src}
                width={foto.width}
                height={foto.height}
                alt={foto.alt ?? ""}
                loading="lazy"
                decoding="async"
              />
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}
