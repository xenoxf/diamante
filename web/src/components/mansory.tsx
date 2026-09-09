import type { GalleryImage } from "../types";
import styles from "../styles/galeria.module.css";

interface MasonryProps {
  fotos: GalleryImage[];
}

export default function Masonry({ fotos }: MasonryProps) {
  const columns: GalleryImage[][] = [[], [], []];
  const heights = [0, 0, 0];

  fotos.forEach((foto) => {
    const shortestColumn = heights.indexOf(Math.min(...heights));

    columns[shortestColumn].push(foto);

    heights[shortestColumn] += foto.height / foto.width;
  });

  return (
    <div className={styles.masonry}>
      {columns.map((column, columnIndex) => (
        <div className={styles.masonryColumn} key={columnIndex}>
          {column.map((foto) => (
            <a
              key={foto.src}
              className={styles.mItem}
              href={foto.src}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir fotografía en tamaño completo"
            >
              <img
                src={foto.src}
                width={foto.width}
                height={foto.height}
                alt=""
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
