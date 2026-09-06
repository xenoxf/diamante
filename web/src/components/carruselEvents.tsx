import { useCallback, useEffect, useRef, useState } from 'react';
import { carruselService } from '../services/carrusel.service';
import type { CarruselSlide } from '../types/carrusel.types';
import styles from '../styles/carruselEvents.module.css';

interface Props {
  limit?: number;
}

export function CarruselEvents({ limit = 8 }: Props) {
  const [slides, setSlides] = useState<CarruselSlide[]>([]);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set());
  const timer = useRef<number | null>(null);
  const paused = useRef(false);
  const touchX = useRef<number | null>(null);

  const list = slides.filter((s) => !failed.has(s.id));
  const safeIndex = list.length > 0 ? index % list.length : 0;

  useEffect(() => {
    const controller = new AbortController();
    carruselService.getCarruselSlides(limit, controller.signal).then((data) => {
      if (controller.signal.aborted) return;
      setSlides(data);
      setReady(true);
    });
    return () => controller.abort();
  }, [limit]);

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
    }, carruselService.carruselConfig.autoplayMs);
  }, [list.length, stop]);

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
      aria-label="Paisajes"
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
        {list.map((slide, i) => (
          <div
            key={slide.id}
            className={`${styles.slide} ${i === safeIndex ? styles.isActive : ''}`}
            aria-hidden={i !== safeIndex}
          >
            <img
              className={styles.img}
              src={slide.src}
              srcSet={slide.srcSet}
              sizes={slide.sizes}
              alt=""
              draggable={false}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              onError={() => markFailed(slide.id)}
              {...(i === 0 ? { fetchPriority: 'high' as const } : {})}
            />
          </div>
        ))}
      </div>

      {current && (
        <a className={styles.go} href={current.href} aria-label="Ir a galería">
          IR
          <span aria-hidden="true">›</span>
        </a>
      )}
    </section>
  );
}
