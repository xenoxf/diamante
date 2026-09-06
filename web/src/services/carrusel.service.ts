import type { CarruselConfig, CarruselSlide } from '../types/carrusel.types';
import { landscapeService } from './landscape.service';

const carruselConfig: CarruselConfig = {
  autoplayMs: 4500,
  transitionMs: 1200,
};

async function getCarruselSlides(limit = 8, signal?: AbortSignal): Promise<CarruselSlide[]> {
  const slides = await landscapeService.getLandscapeSlides(limit, signal);
  return slides.map((s) => ({
    id: s.id,
    src: s.image.src,
    srcSet: s.image.srcSet,
    sizes: s.image.sizes,
    alt: s.alt,
    href: s.href,
  }));
}

export const carruselService = {
  carruselConfig,
  getCarruselSlides,
};
