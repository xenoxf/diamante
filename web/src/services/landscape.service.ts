/**
 * @deprecated - Este servicio existía para cargar paisajes desde Wikimedia Commons / Picsum.
 * Ahora está deprecado: internamente delega a Strapi (slides-carrusel y galeria-items)
 * y mantiene el fallback a Picsum/Commons para compatibilidad.
 *
 * Páginas y componentes deben migrar a:
 *  - carruselService.getCarruselSlides() para carrusel
 *  - galeriaService.getGaleriaImages() para galería
 *
 * Se mantiene export para no romper imports existentes.
 */

import type { GalleryImage, LandscapeSlide } from '../types/landscape.types';
import { fetchStrapi } from '../lib/strapi';
import {
  mapStrapiGaleriaToGalleryImages,
  mapStrapiSlidesToLandscape,
} from '../lib/mappers';
import type { StrapiCollectionResponse } from '../lib/strapi-types';

const TARGET_HREF = '/galeria';
const SIZES = '(max-width: 640px) 640px, (max-width: 1024px) 1024px, (max-width: 1600px) 1600px, 1920px';

/** IDs de Picsum verificados como paisajes/naturaleza. Solo fallback sin red. */
const FALLBACK_IDS = ['1015', '1016', '1018', '1019', '1036', '1039', '10', '28'];

function picsumSrc(id: string, w: number, h: number): string {
  return `https://picsum.photos/id/${id}/${w}/${h}`;
}

function picsumSrcSet(id: string): string {
  return [
    `${picsumSrc(id, 640, 360)} 640w`,
    `${picsumSrc(id, 1024, 576)} 1024w`,
    `${picsumSrc(id, 1600, 900)} 1600w`,
    `${picsumSrc(id, 1920, 1080)} 1920w`,
  ].join(', ');
}

function picsumFallback(limit: number): LandscapeSlide[] {
  return FALLBACK_IDS.slice(0, limit).map((id) => ({
    id: `paisaje-${id}`,
    image: {
      src: picsumSrc(id, 1920, 1080),
      srcSet: picsumSrcSet(id),
      sizes: SIZES,
      width: 1920,
      height: 1080,
    },
    alt: '',
    href: TARGET_HREF,
  }));
}

function picsumGalleryFallback(count: number): GalleryImage[] {
  const ratios: Array<[number, number]> = [
    [600, 800],
    [600, 450],
    [600, 600],
    [600, 750],
    [600, 500],
    [600, 850],
  ];
  return Array.from({ length: count }, (_, i) => {
    const id = FALLBACK_IDS[i % FALLBACK_IDS.length]!;
    const [w, h] = ratios[i % ratios.length]!;
    return {
      id: `galeria-${id}-${i}`,
      src: picsumSrc(id, w, h),
      width: w,
      height: h,
      alt: '',
      href: TARGET_HREF,
    };
  });
}

// ---------------------------------------------------------------------------
// Intentar Strapi primero, fallback a Picsum (sin Commons para evitar dependencia externa)
// Commons se mantiene comentado como referencia, pero Strapi es prioritario.
// ---------------------------------------------------------------------------

async function getLandscapeSlides(limit = 8, signal?: AbortSignal): Promise<LandscapeSlide[]> {
  try {
    const res = await fetchStrapi<StrapiCollectionResponse<any>>('/slides-carrusel', {
      params: {
        filters: { activo: { $eq: true } },
        sort: ['orden:asc'],
        pagination: { pageSize: limit },
        populate: { imagen: { fields: ['url', 'width', 'height', 'formats', 'alternativeText'] } },
        status: 'published',
      },
      fetchOptions: { signal } as any,
    });
    const data: any[] = (res as any).data ?? [];
    const slides = mapStrapiSlidesToLandscape(data).slice(0, limit);
    if (slides.length >= 2) return slides;
    if (slides.length > 0) return [...slides, ...picsumFallback(limit - slides.length)].slice(0, limit);
    throw new Error('Sin slides Strapi');
  } catch (err) {
    if ((signal as any)?.aborted) return [];
    console.warn('[landscapeService.getLandscapeSlides] Deprecado: Strapi falla, fallback Picsum:', err);
    return picsumFallback(limit);
  }
}

async function getGalleryImages(count = 16, signal?: AbortSignal): Promise<GalleryImage[]> {
  try {
    const res = await fetchStrapi<StrapiCollectionResponse<any>>('/galeria-items', {
      params: {
        populate: {
          imagen: { fields: ['url', 'width', 'height', 'formats', 'alternativeText'] },
          categoria: { fields: ['nombre'] },
        },
        sort: ['orden:asc', 'createdAt:desc'],
        pagination: { pageSize: count },
        status: 'published',
      },
      fetchOptions: { signal } as any,
    });
    const data: any[] = (res as any).data ?? [];
    const images = mapStrapiGaleriaToGalleryImages(data).slice(0, count);
    if (images.length >= Math.min(6, count)) return images;
    if (images.length > 0) {
      const missing = count - images.length;
      return [...images, ...picsumGalleryFallback(missing)];
    }
    throw new Error('Sin imágenes Strapi');
  } catch (err) {
    if ((signal as any)?.aborted) return [];
    console.warn('[landscapeService.getGalleryImages] Deprecado: fallback Picsum:', err);
    return picsumGalleryFallback(count);
  }
}

export const landscapeService = {
  getLandscapeSlides,
  getGalleryImages,
};
