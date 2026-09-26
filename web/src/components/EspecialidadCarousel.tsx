import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  images: string[];
  alt: string;
  autoplayMs?: number;
  className?: string;
  imgClassName?: string;
}

/**
 * Carrusel con fundido (crossfade) para cada especialidad.
 * - Strapi `imagenes` es media múltiple: si hay N imágenes, rotan con fundido.
 * - Si hay 1 sola imagen, renderiza <img> estático (sin timers).
 * - Pausa en hover/focus, respeta prefers-reduced-motion, dots + flechas.
 */
export function EspecialidadCarousel({
  images,
  alt,
  autoplayMs = 4000,
  className,
  imgClassName,
}: Props) {
  const list = (images ?? []).filter(Boolean);
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);
  const paused = useRef(false);

  const stop = useCallback(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (list.length < 2 || paused.current) return;
    stop();
    timer.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, autoplayMs);
  }, [list.length, autoplayMs, stop]);

  useEffect(() => {
    if (list.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    start();
    const onVis = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [list.length, start, stop]);

  useEffect(() => () => stop(), [stop]);

  if (list.length === 0) return null;

  if (list.length === 1) {
    return (
      <img
        className={imgClassName}
        src={list[0]}
        alt=""
        loading="lazy"
        decoding="async"
      />
    );
  }

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + list.length) % list.length);

  return (
    <div
      className={className}
      style={{ position: 'relative', overflow: 'hidden' }}
      role="region"
      aria-roledescription="carrusel"
      aria-label={`Imágenes de ${alt}`}
      onMouseEnter={() => {
        paused.current = true;
        stop();
      }}
      onMouseLeave={() => {
        paused.current = false;
        start();
      }}
      onFocus={() => {
        paused.current = true;
        stop();
      }}
      onBlur={() => {
        paused.current = false;
        start();
      }}
    >
      {list.map((src, i) => (
        <img
          key={`${src}-${i}`}
          className={imgClassName}
          src={src}
          alt=""
          aria-hidden={i !== index}
          loading={i === 0 ? 'eager' : 'lazy'}
          decoding="async"
          style={{
            opacity: i === index ? 1 : 0,
            transition: 'opacity 900ms ease-in-out',
            position: i === 0 ? 'relative' : 'absolute',
            inset: i === 0 ? undefined : 0,
            pointerEvents: i === index ? 'auto' : 'none',
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          left: 8,
          right: 8,
          bottom: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          /* por encima del enlace extendido del título de la tarjeta */
          zIndex: 2,
        }}
      >
        <button
          type="button"
          aria-label="Imagen anterior"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            go(-1);
          }}
          style={navBtn}
        >
          ‹
        </button>
        <div style={{ display: 'flex', gap: 6 }} aria-label="Selector de imagen">
          {list.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-current={i === index ? 'true' : undefined}
              aria-label={`Ir a imagen ${i + 1}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIndex(i);
              }}
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,.9)',
                background: i === index ? '#fff' : 'rgba(255,255,255,.35)',
                padding: 0,
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Imagen siguiente"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            go(1);
          }}
          style={navBtn}
        >
          ›
        </button>
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,.7)',
  background: 'rgba(0,0,0,.45)',
  color: '#fff',
  fontSize: 16,
  lineHeight: 1,
  cursor: 'pointer',
};

export default EspecialidadCarousel;
