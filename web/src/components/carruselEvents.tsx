import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { carruselService } from '../services/carrusel.service';
import type { CarruselSlide, CarruselConfig } from '../types/carrusel.types';
import styles from '../styles/carruselEvents.module.css';

interface Props {
  limit?: number;
  slides?: CarruselSlide[];
  config?: CarruselConfig;
}

interface GoButtonProps {
  href: string;
  label: string;
  ariaLabel: string;
  openInNewTab?: boolean;
}

/**
 * Botón IR con marquee automático infinito cuando el texto de Strapi
 * desborda el ancho disponible (según longitud del texto + viewport).
 * - Mide overflow real con scrollWidth vs clientWidth + ResizeObserver.
 * - Solo anima si hay desborde; si no, ellipsis clásico.
 * - Velocidad constante (~45px/s), distancia = ancho de una copia.
 * - Respeta prefers-reduced-motion.
 */
function GoButton({
  href,
  label,
  ariaLabel,
  openInNewTab,
}: GoButtonProps) {
  const viewportRef = useRef<HTMLSpanElement>(null);
  const firstTextRef = useRef<HTMLSpanElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  const [marquee, setMarquee] = useState(false);
  const [duration, setDuration] = useState(6);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    if (reduceMotion.matches) {
      setMarquee(false);
      return;
    }

    const viewport = viewportRef.current;
    const first = firstTextRef.current;
    const link = linkRef.current;

    if (!viewport || !first) return;

    const PX_PER_SECOND = 42;
    const MIN_DURATION = 4;
    const MAX_DURATION = 14;

    const checkOverflow = () => {
      const viewportWidth = viewport.clientWidth;
      const textWidth = first.scrollWidth;

      if (!viewportWidth || !textWidth) {
        setMarquee(false);
        return;
      }

      const overflowing = textWidth > viewportWidth + 1;

      setMarquee(overflowing);

      if (overflowing) {
        const distance = textWidth + 40;

        const nextDuration = Math.min(
          MAX_DURATION,
          Math.max(
            MIN_DURATION,
            distance / PX_PER_SECOND
          )
        );

        setDuration(nextDuration);
      }
    };

    // Primera medición
    checkOverflow();

    // Detecta cambios de tamaño del botón/texto
    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(checkOverflow);

      resizeObserver.observe(viewport);

      if (link) {
        resizeObserver.observe(link);
      }
    }

    // Fallback / cambios de viewport
    window.addEventListener('resize', checkOverflow);

    // Espera a que las fuentes terminen de cargar.
    // Esto es importante porque una fuente distinta puede
    // cambiar bastante el ancho real del texto.
    document.fonts?.ready
      .then(checkOverflow)
      .catch(() => { });

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', checkOverflow);
    };
  }, [label]);

  return (
    <a
      ref={linkRef}
      className={styles.go}
      href={href}
      title={label}
      target={openInNewTab ? '_blank' : undefined}
      rel={
        openInNewTab
          ? 'noopener noreferrer'
          : undefined
      }
      data-marquee={marquee ? 'true' : 'false'}
      style={{
        ['--go-marquee-duration' as string]:
          `${duration}s`,
      }}
    >
      <span
        ref={viewportRef}
        className={styles.goViewport}
      >
        <span className={styles.goTrack}>
          <span
            ref={firstTextRef}
            className={styles.goText}
          >
            {/* Contexto solo para tecnología de asistencia: el nombre
                accesible sigue conteniendo el texto visible (WCAG 2.5.3). */}
            {ariaLabel && ariaLabel !== label && (
              <span className={styles.srOnly}>{ariaLabel}: </span>
            )}
            {label}
          </span>

          <span
            className={styles.goText}
            aria-hidden="true"
          >
            {label}
          </span>
        </span>
      </span>

      <span
        className={styles.goArrow}
        aria-hidden="true"
      >
        ›
      </span>
    </a>
  );
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
                  {slide.tituloOverlay && <h2 className={styles.overlayTitle}>{slide.tituloOverlay}</h2>}
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
          <GoButton
            key={current.id}
            href={current.href}
            label={current.botonTexto || 'IR'}
            ariaLabel={current.tituloOverlay ? `Ir a ${current.tituloOverlay}` : current.botonTexto || 'Ir'}
            openInNewTab={current.abrirEnNuevaPestana}
          />
        )}

        {list.length > 1 && (
          <div className={styles.dots}>
            {list.map((s, i) => (
              <button
                key={`dot-${s.id}`}
                className={`${styles.dot} ${i === safeIndex ? styles.dotActive : ''}`}
                aria-label={`Ir a slide ${i + 1}${s.tituloOverlay ? `: ${s.tituloOverlay}` : ''}`}
                aria-current={i === safeIndex ? 'true' : undefined}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
