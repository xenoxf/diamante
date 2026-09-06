import { useEffect, useState } from 'react';
import { galeriaService } from '../services/galeria.service';
import type { GalleryImage } from '../types/landscape.types';
import styles from '../styles/galeria.module.css';

const COUNT = 16;
const SKELETON = 8;

function Track({ images, extraClass }: { images: GalleryImage[]; extraClass: string }) {
  const doubled = [...images, ...images];
  return (
    <div className={`${styles.track} ${extraClass}`}>
      {doubled.map((img, i) => {
        const dup = i >= images.length;
        return (
          <a
            key={`${img.id}-${i}`}
            href="/galeria"
            className={styles.card}
            aria-hidden={dup || undefined}
            tabIndex={dup ? -1 : undefined}
            aria-label={dup ? undefined : 'Ver galería'}
          >
            <img
              className={styles.shot}
              src={img.src}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </a>
        );
      })}
    </div>
  );
}

export function Galeria() {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    galeriaService.getGaleriaImages(COUNT, controller.signal).then((data) => {
      if (!controller.signal.aborted) setImages(data);
    });
    return () => controller.abort();
  }, []);

  const half = Math.ceil(images.length / 2);
  const rowA = images.slice(0, half);
  const rowB = images.slice(half);

  return (
    <section id="galeria" className={styles.section} aria-labelledby="galeria-titulo">
      <div className={styles.inner}>
        <h2 id="galeria-titulo" className={styles.title}>
          Nuestra Galería
          <div className={styles.rule} aria-hidden="true" />
        </h2>
        <a className={styles.link} href="/galeria">Ver galeria completa</a>
        
      </div>

      <div className={styles.marquee} role="presentation">
        {images.length === 0 ? (
          <div className={styles.track} aria-hidden="true">
            {Array.from({ length: SKELETON }, (_, i) => (
              <div key={i} className={`${styles.card} ${styles.ph}`} />
            ))}
          </div>
        ) : (
          <>
            <Track images={rowA} extraClass={styles.trackA} />
            <Track images={rowB} extraClass={styles.trackB} />
          </>
        )}
      </div>
      
    </section>
  );
}
