import { useCallback, useEffect, useRef, useState } from 'react';
import { carruselService } from '../services/carrusel.service';
import type { CarruselSlide, CarruselConfig } from '../types/carrusel.types';
import styles from '../styles/carruselEvents.module.css';

interface Props {
  limit?: number;
  slides?: CarruselSlide[];
  config?: CarruselConfig;
}

export function CarruselEvents({ limit = 8, slides: initialSlides, config }: Props) {
  const [slides, setSlides] = useState<CarruselSlide[]>(initialSlides ?? []);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(!!initialSlides && initialSlides.length > 0);
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set());
  const timer = useRef<number | null>(null);
  const paused = useRef(false);
  const touchX = useRef<number | null>(null);

  // Si config viene por prop (SSR desde pagina-inicio.carruselConfig), sincronizar con servicio
  useEffect(() => {
    if (config?.autoplayMs) carruselService.carruselConfig.autoplayMs = config.autoplayMs;
    if (config?.transitionMs) carruselService.carruselConfig.transitionMs = config.transitionMs;
  }, [config]);

  const list = slides.filter((s) => !failed.has(s.id));
  const safeIndex = list.length > 0 ? index % list.length : 0;

  useEffect(() => {
    // Si ya vienen slides por prop (SSR), no hacer fetch client
    if (initialSlides && initialSlides.length > 0) return;
    const controller = new AbortController();
    carruselService.getCarruselSlides(limit, controller.signal).then((data) => {
      if (controller.signal.aborted) return;
      setSlides(data);
      setReady(true);
    });
    return () => controller.abort();
  }, [limit, initialSlides]);

  const stop = useCallback(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (list.length < 2 || paused.current) return;
    stop();
    const ms = config?.autoplayMs ?? carruselService.carruselConfig.autoplayMs;
    timer.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, ms);
  }, [list.length, stop, config?.autoplayMs]);

  useEffect(() => {
    if (!ready) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    start();
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [ready, start, stop]);

  const pause = useCallback(() => {
    paused.current = true;
    stop();
  }, [stop]);

  const resume = useCallback(() => {
    paused.current = false;
    start();
  }, [start]);

  const markFailed = useCallback((id: string) => {
    setFailed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const current = list[safeIndex];

  return (
    <section
      className={styles.carousel}
      aria-roledescription="carrusel"
      aria-label="Carrusel de eventos"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onTouchStart={(e) => {
        pause();
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const startX = touchX.current;
        touchX.current = null;
        if (startX !== null && list.length > 1) {
          const dx = e.changedTouches[0]?.clientX ?? startX;
          if (dx - startX < -40) setIndex((i) => (i + 1) % list.length);
          else if (dx - startX > 40) setIndex((i) => (i - 1 + list.length) % list.length);
        }
        resume();
      }}
    >
      <div className={styles.viewport} aria-busy={!ready}>
        {list.map((slide, i) => {
          const hasOverlay = !!(slide.tituloOverlay || slide.descripcionOverlay);
          return (
            <div
              key={slide.id}
              className={`${styles.slide} ${i === safeIndex ? styles.isActive : ''} ${hasOverlay ? styles.hasOverlay : ''}`}
              aria-hidden={i !== safeIndex}
            >
              <img
                className={styles.img}
                src={slide.src}
                srcSet={slide.srcSet}
                sizes={slide.sizes}
                alt={slide.alt || ''}
                draggable={false}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                onError={() => markFailed(slide.id)}
                {...(i === 0 ? { fetchPriority: 'high' as const } : {})}
              />
              {hasOverlay && (
                <div className={styles.overlay}>
                  {slide.tituloOverlay && <h3 className={styles.overlayTitle}>{slide.tituloOverlay}</h3>}
                  {slide.descripcionOverlay && <p className={styles.overlayDesc}>{slide.descripcionOverlay}</p>}
                </div>
              )}
              {/* degradado para legibilidad si hay overlay */}
              {hasOverlay && <div className={styles.scrim} aria-hidden="true" />}
            </div>
          );
        })}
      </div>

      <div className={styles.containerActions}>
        {current && (
          <a
            className={styles.go}
            href={current.href}
            aria-label={current.tituloOverlay ? `Ir a ${current.tituloOverlay}` : current.botonTexto || 'Ir'}
            target={current.abrirEnNuevaPestana ? '_blank' : undefined}
            rel={current.abrirEnNuevaPestana ? 'noopener noreferrer' : undefined}
          >
            {current.botonTexto || 'IR'}
            <span aria-hidden="true">›</span>
          </a>
        )}

        {list.length > 1 && (
          <div className={styles.dots} role="tablist" aria-label="Selector de slides">
            {list.map((s, i) => (
              <button
                key={`dot-${s.id}`}
                className={`${styles.dot} ${i === safeIndex ? styles.dotActive : ''}`}
                aria-label={`Ir a slide ${i + 1}${s.tituloOverlay ? `: ${s.tituloOverlay}` : ''}`}
                aria-selected={i === safeIndex}
                role="tab"
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
