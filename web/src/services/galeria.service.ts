import type { GaleriaItem } from '../types/galeria.types';
import type { GalleryImage } from '../types/landscape.types';
import { galeria as galeriaFallback } from '../data/galeria';
import { fetchStrapi } from '../lib/strapi';
import { attachSource } from '../lib/data-source';
import {
  mapStrapiGaleriaItemToLegacy,
  mapStrapiGaleriaToGalleryImages,
} from '../lib/mappers';
import type { StrapiCollectionResponse } from '../lib/strapi-types';

/**
 * Fallback para GalleryImage cuando Strapi no tiene imágenes.
 * Replica lógica picsum fallback previa (ver landscape.service original).
 */
const FALLBACK_IDS = ['1015', '1016', '1018', '1019', '1036', '1039', '10', '28'];
const TARGET_HREF = '/galeria';

function picsumSrc(id: string, w: number, h: number): string {
  return `https://picsum.photos/id/${id}/${w}/${h}`;
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

export const galeriaService = {
  async getGaleria(): Promise<GaleriaItem[]> {
    try {
      const res = await fetchStrapi<StrapiCollectionResponse<any>>('/galeria-items', {
        params: {
          populate: {
            categoria: { fields: ['nombre', 'slug'] },
            imagen: { fields: ['url', 'width', 'height'] },
          },
          sort: ['orden:asc', 'titulo:asc'],
          pagination: { pageSize: 100 },
          status: 'published',
        },
      });
      const data: any[] = (res as any).data ?? [];
      if (!Array.isArray(data) || data.length === 0) return galeriaFallback;
      return data.map(mapStrapiGaleriaItemToLegacy);
    } catch (err) {
      console.warn('[galeriaService.getGaleria] fallback:', err);
      return galeriaFallback;
    }
  },

  async getGaleriaByCategoria(categoria: string): Promise<GaleriaItem[]> {
    try {
      const all = await this.getGaleria();
      const filtrados = all.filter((g) => g.categoria.toLowerCase() === categoria.toLowerCase());
      if (filtrados.length > 0) return filtrados;

      // Intento con filtro Strapi por slug de categoria
      const slug = categoria.toLowerCase().replace(/\s+/g, '-');
      try {
        const res = await fetchStrapi<StrapiCollectionResponse<any>>('/galeria-items', {
          params: {
            filters: { categoria: { slug: { $eq: slug } } },
            populate: { categoria: { fields: ['nombre', 'slug'] } },
            pagination: { pageSize: 100 },
            status: 'published',
          },
        });
        const data: any[] = (res as any).data ?? [];
        if (Array.isArray(data) && data.length > 0) return data.map(mapStrapiGaleriaItemToLegacy);
      } catch {
        // ignore
      }

      return galeriaFallback.filter((g) => g.categoria === categoria);
    } catch {
      return galeriaFallback.filter((g) => g.categoria === categoria);
    }
  },

  async getGaleriaImages(
    count = 16,
    signal?: AbortSignal,
    opts?: { destacadoHome?: boolean },
  ): Promise<GalleryImage[]> {
    // Soportar sobrecarga: getGaleriaImages(16, { destacadoHome: true })
    let actualSignal: AbortSignal | undefined = signal;
    let actualOpts = opts;
    if (signal && typeof signal === 'object' && !(signal instanceof AbortSignal) && !('aborted' in signal)) {
      // signal es opts
      actualOpts = signal as any;
      actualSignal = undefined;
    }
    const destacadoHome = actualOpts?.destacadoHome;

    try {
      const params: Record<string, any> = {
        populate: {
          imagen: { fields: ['url', 'width', 'height', 'formats', 'alternativeText'] },
          categoria: { fields: ['nombre', 'slug'] },
        },
        sort: ['orden:asc', 'createdAt:desc'],
        pagination: { pageSize: count },
        status: 'published',
      };
      if (typeof destacadoHome === 'boolean') {
        (params as any).filters = { destacadoHome: { $eq: destacadoHome } };
        // Si filtra destacadoHome, pedir más para compensar fallback; si no hay suficientes, luego intentar sin filtro
      }

      const res = await fetchStrapi<StrapiCollectionResponse<any>>('/galeria-items', {
        params,
        fetchOptions: { signal: actualSignal } as any,
      });
      const data: any[] = (res as any).data ?? [];
      const images = mapStrapiGaleriaToGalleryImages(data).slice(0, count);
      if (images.length >= Math.min(6, count)) return attachSource(images, 'strapi');
      // Si filtro destacadoHome y no hay suficientes, reintentar sin filtro
      if (typeof destacadoHome === 'boolean' && images.length < Math.min(6, count)) {
        try {
          const res2 = await fetchStrapi<StrapiCollectionResponse<any>>('/galeria-items', {
            params: {
              populate: {
                imagen: { fields: ['url', 'width', 'height', 'formats', 'alternativeText'] },
                categoria: { fields: ['nombre', 'slug'] },
              },
              sort: ['orden:asc', 'createdAt:desc'],
              pagination: { pageSize: count },
              status: 'published',
            },
            fetchOptions: { signal: actualSignal } as any,
          });
          const data2: any[] = (res2 as any).data ?? [];
          const images2 = mapStrapiGaleriaToGalleryImages(data2).slice(0, count);
          if (images2.length > 0) {
            if (images2.length >= Math.min(6, count)) return attachSource(images2, 'strapi');
            if (images2.length < count) {
              const missing = count - images2.length;
              return attachSource([...images2, ...picsumGalleryFallback(missing)], 'fallback');
            }
          }
        } catch {
          // ignore, fallback below
        }
      }
      // Si no hay suficientes imágenes con media, fallback parcial + picsum
      if (images.length > 0 && images.length < count) {
        const missing = count - images.length;
        return attachSource([...images, ...picsumGalleryFallback(missing)], 'fallback');
      }
      if (images.length === 0) throw new Error('Sin imágenes Strapi');
      return attachSource(images, 'strapi');
    } catch (err) {
      if ((actualSignal as any)?.aborted) return [];
      console.warn('[galeriaService.getGaleriaImages] Strapi falla, usando picsum fallback:', err);
      return attachSource(picsumGalleryFallback(count), 'fallback');
    }
  },

  /**
   * Versión genérica que acepta params Strapi directos (pagination, populate, filters, sort).
   * Útil para galeria.astro que requiere filtros por categoría y pagination.
   * Usa getStrapiMediaUrl internamente via mapper.
   */
  async getGaleriaItems(params?: Record<string, any>, signal?: AbortSignal): Promise<GalleryImage[]> {
    try {
      const merged: Record<string, any> = {
        populate: {
          imagen: { fields: ['url', 'width', 'height', 'formats', 'alternativeText'] },
          categoria: { fields: ['nombre', 'slug'] },
        },
        sort: ['orden:asc', 'createdAt:desc'],
        status: 'published',
        ...params,
      };
      // Asegurar populate categoria+imagen si no se pasa
      if (!merged.populate) {
        merged.populate = {
          imagen: { fields: ['url', 'width', 'height', 'formats', 'alternativeText'] },
          categoria: { fields: ['nombre', 'slug'] },
        };
      }
      const res = await fetchStrapi<StrapiCollectionResponse<any>>('/galeria-items', {
        params: merged,
        fetchOptions: { signal } as any,
      });
      const data: any[] = (res as any).data ?? [];
      const images = mapStrapiGaleriaToGalleryImages(data);
      // Si caller pidió pagination pageSize, ya viene sliceado por Strapi; no slicear extra
      if (images.length === 0) return [];
      return images;
    } catch (err) {
      if ((signal as any)?.aborted) return [];
      console.warn('[galeriaService.getGaleriaItems] fallback:', err);
      return [];
    }
  },
};
