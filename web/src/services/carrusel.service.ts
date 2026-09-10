import type { CarruselConfig, CarruselSlide } from '../types/carrusel.types';
import { fetchStrapi } from '../lib/strapi';
import { attachSource } from '../lib/data-source';
import { mapStrapiSlidesToCarrusel } from '../lib/mappers';
import type { StrapiCollectionResponse } from '../lib/strapi-types';

const carruselConfig: CarruselConfig = {
  autoplayMs: 4500,
  transitionMs: 1200,
};

// Fallback picsum SOLO cuando Strapi no está disponible
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
    botonTexto: 'IR',
    abrirEnNuevaPestana: false,
    tituloOverlay: null,
    descripcionOverlay: null,
    titulo: null,
    fuente: 'manual' as const,
    origenImagen: 'manual' as const,
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

async function fetchHeroSlidesFromPaginaInicio(limit: number, signal?: AbortSignal): Promise<CarruselSlide[] | null> {
  try {
    const res: any = await fetchStrapi('/pagina-inicio', {
      params: {
        populate: {
          carruselConfig: { populate: '*' },
          heroSlides: {
            sort: ['orden:asc', 'createdAt:asc'],
            filters: { activo: { $eq: true } },
            populate: {
              imagen: { fields: ['url', 'width', 'height', 'formats', 'alternativeText'] },
              galeria_item: {
                populate: {
                  imagen: { fields: ['url', 'width', 'height', 'formats', 'alternativeText'] },
                  categoria: { fields: ['nombre', 'slug'] },
                },
              },
            },
          },
        },
        status: 'published',
      },
      fetchOptions: { signal } as any,
    });
    const entity: any = res?.data ?? res;
    const data: any = entity?.data ?? entity;
    const unwrapped: any = data?.attributes ?? data;
    // Sincronizar config si viene
    const cfg = unwrapped?.carruselConfig;
    if (cfg?.autoplayMs) carruselConfig.autoplayMs = cfg.autoplayMs;
    if (cfg?.transitionMs) carruselConfig.transitionMs = cfg.transitionMs;

    const heroRaw: any[] | null = unwrapped?.heroSlides ?? null;
    if (!Array.isArray(heroRaw) || heroRaw.length === 0) return null;
    // Filtro cliente por activo (por si Strapi ignoró filters en populate de single)
    const filtered = heroRaw.filter((h: any) => {
      const ent = (h as any)?.activo ?? (h as any)?.attributes?.activo;
      return ent !== false;
    });
    // Orden cliente por orden asc + createdAt asc (respaldo si populate sort no aplicó)
    filtered.sort((a: any, b: any) => {
      const ao = (a as any)?.orden ?? (a as any)?.attributes?.orden ?? 0;
      const bo = (b as any)?.orden ?? (b as any)?.attributes?.orden ?? 0;
      if (ao !== bo) return ao - bo;
      const at = new Date((a as any)?.createdAt ?? (a as any)?.attributes?.createdAt ?? 0).getTime();
      const bt = new Date((b as any)?.createdAt ?? (b as any)?.attributes?.createdAt ?? 0).getTime();
      return at - bt;
    });
    const slides = mapStrapiSlidesToCarrusel(filtered).slice(0, limit);
    if (slides.length === 0) return null;
    return slides;
  } catch (e) {
    // Si pagina-inicio no tiene heroSlides (migración pendiente), ignorar y fallback a colección
    // console.debug('[carruselService] heroSlides fetch failed, fallback to collection', e);
    return null;
  }
}

async function fetchSlidesFromCollection(limit: number, signal?: AbortSignal): Promise<CarruselSlide[] | null> {
  // Intento 1: con populate galeria_item (nuevo schema). Si falla por schema no migrado, reintenta sin él.
  const baseParams: Record<string, any> = {
    filters: { activo: { $eq: true } },
    sort: ['orden:asc', 'createdAt:asc'],
    pagination: { pageSize: limit },
    status: 'published',
  };
  const fullPopulate: Record<string, any> = {
    imagen: { fields: ['url', 'width', 'height', 'formats', 'alternativeText'] },
    galeria_item: {
      populate: {
        imagen: { fields: ['url', 'width', 'height', 'formats', 'alternativeText'] },
        categoria: { fields: ['nombre', 'slug'] },
      },
    },
  };
  const simplePopulate: Record<string, any> = {
    imagen: { fields: ['url', 'width', 'height', 'formats', 'alternativeText'] },
  };

  for (const populate of [fullPopulate, simplePopulate]) {
    try {
      const res = await fetchStrapi<StrapiCollectionResponse<any>>('/slides-carrusel', {
        params: { ...baseParams, populate },
        fetchOptions: { signal } as any,
      });
      const data: any[] = (res as any).data ?? [];
      const slides = mapStrapiSlidesToCarrusel(data).slice(0, limit);
      if (slides.length > 0) return slides;
      return [];
    } catch (err: any) {
      const msg = String(err?.message ?? '');
      // Si es error de populate desconocido, probar siguiente variante
      if (msg.includes('populate') || msg.includes('galeria_item')) continue;
      throw err;
    }
  }
  return null;
}

async function getCarruselSlides(limit = 8, signal?: AbortSignal, skipConfig = false): Promise<CarruselSlide[]> {
  try {
    if (!skipConfig) {
      try {
        await getCarruselConfig(signal);
      } catch {
        // ignore
      }
    }

    // 1. Intentar heroSlides configurados desde Página Inicio (Hero administrable)
    const heroSlides = await fetchHeroSlidesFromPaginaInicio(limit, signal);
    if (heroSlides && heroSlides.length >= 1) {
      // Si el admin seleccionó heroSlides, respetar exactamente esa selección
      if (heroSlides.length >= 2) return attachSource(heroSlides, 'strapi');
      if (heroSlides.length === 1 && limit > 1) {
        // Completar con colección si solo hay 1 seleccionado (evitar carrusel de 1)
        const extra = await fetchSlidesFromCollection(limit - 1, signal);
        const extraFiltered = (extra ?? []).filter((s) => !heroSlides.some((h) => h.id === s.id));
        const combined = [...heroSlides, ...extraFiltered].slice(0, limit);
        if (combined.length >= 2) return attachSource(combined, 'strapi');
        return attachSource(heroSlides, 'strapi');
      }
      // 1 slide y limit 1
      return attachSource(heroSlides, 'strapi');
    }

    // 2. Fallback a colección general slides-carrusel
    const slides = await fetchSlidesFromCollection(limit, signal);
    if (slides && slides.length >= 2) return attachSource(slides, 'strapi');
    if (slides && slides.length > 0) return attachSource(slides, 'strapi');
    
    // Sin slides de Strapi
    return [];
  } catch (err) {
    if ((signal as any)?.aborted) return [];
    // Strapi no disponible → usar fallback picsum
    console.warn('[carruselService.getCarruselSlides] Strapi no disponible, usando fallback:', err);
    return attachSource(picsumFallback(limit), 'fallback');
  }
}

export const carruselService = {
  carruselConfig,
  getCarruselSlides,
  getCarruselConfig,
};
