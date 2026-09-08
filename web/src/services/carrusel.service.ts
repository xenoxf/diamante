import type { CarruselConfig, CarruselSlide } from '../types/carrusel.types';
import { fetchStrapi } from '../lib/strapi';
import { attachSource } from '../lib/data-source';
import { mapStrapiSlidesToCarrusel } from '../lib/mappers';
import type { StrapiCollectionResponse } from '../lib/strapi-types';

const carruselConfig: CarruselConfig = {
  autoplayMs: 4500,
  transitionMs: 1200,
};

// Fallback picsum ids si Strapi no tiene slides con imagen
const FALLBACK_IDS = ['1015', '1016', '1018', '1019', '1036', '1039', '10', '28'];
const TARGET_HREF = '/galeria';
const SIZES = '(max-width: 640px) 640px, (max-width: 1024px) 1024px, (max-width: 1600px) 1600px, 1920px';

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
function picsumFallback(limit: number): CarruselSlide[] {
  return FALLBACK_IDS.slice(0, limit).map((id) => ({
    id: `paisaje-${id}`,
    src: picsumSrc(id, 1920, 1080),
    srcSet: picsumSrcSet(id),
    sizes: SIZES,
    alt: '',
    href: TARGET_HREF,
  }));
}

export async function getCarruselConfig(signal?: AbortSignal): Promise<CarruselConfig> {
  try {
    const cfgRes: any = await fetchStrapi('/pagina-inicio', {
      params: {
        populate: { carruselConfig: { populate: '*' } },
        status: 'published',
      },
      fetchOptions: { signal } as any,
    });
    const cfgData: any = cfgRes?.data ?? cfgRes;
    const cfgEntity = cfgData?.data ?? cfgData;
    const cfg = cfgEntity?.carruselConfig ?? cfgEntity?.attributes?.carruselConfig;
    if (cfg?.autoplayMs) carruselConfig.autoplayMs = cfg.autoplayMs;
    if (cfg?.transitionMs) carruselConfig.transitionMs = cfg.transitionMs;
    return { ...carruselConfig };
  } catch {
    return { ...carruselConfig };
  }
}

async function getCarruselSlides(limit = 8, signal?: AbortSignal, skipConfig = false): Promise<CarruselSlide[]> {
  try {
    // Intentar config desde pagina-inicio para autoplay/transition (solo si no se omite)
    if (!skipConfig) {
      try {
        await getCarruselConfig(signal);
      } catch {
        // ignore
      }
    }

    const res = await fetchStrapi<StrapiCollectionResponse<any>>('/slides-carrusel', {
      params: {
        filters: { activo: { $eq: true } },
        sort: ['orden:asc', 'createdAt:asc'],
        pagination: { pageSize: limit },
        populate: { imagen: { fields: ['url', 'width', 'height', 'formats', 'alternativeText'] } },
        status: 'published',
      },
      fetchOptions: { signal } as any,
    });
    const data: any[] = (res as any).data ?? [];
    const slides = mapStrapiSlidesToCarrusel(data).slice(0, limit);
    if (slides.length >= 2) return attachSource(slides, 'strapi');
    if (slides.length > 0 && slides.length < limit) {
      // Completar con fallback picsum si faltan slides
      const missing = picsumFallback(limit - slides.length);
      return attachSource([...slides, ...missing].slice(0, limit), 'fallback');
    }
    throw new Error('Sin suficientes slides Strapi');
  } catch (err) {
    if ((signal as any)?.aborted) return [];
    console.warn('[carruselService.getCarruselSlides] fallback picsum:', err);
    return attachSource(picsumFallback(limit), 'fallback');
  }
}

export const carruselService = {
  carruselConfig,
  getCarruselSlides,
  getCarruselConfig,
};
