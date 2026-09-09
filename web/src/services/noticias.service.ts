import type { Noticia } from '../types/noticia.types';
import { noticias as noticiasFallback } from '../data/noticias';
import { fetchStrapi } from '../lib/strapi';
import { attachSource } from '../lib/data-source';
import { mapStrapiNoticiaToNoticia } from '../lib/mappers';
import type { StrapiCollectionResponse } from '../lib/strapi-types';

export interface NoticiasQuery {
  destacada?: boolean;
  limit?: number;
  page?: number;
  pageSize?: number;
}

export interface PaginatedNoticias {
  data: Noticia[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

function applyFallbackPagination(
  fallback: Noticia[],
  query?: NoticiasQuery,
): Noticia[] {
  let result = [...fallback];
  // Si destacada=true, intentamos filtrar; como fallback no tiene destacada, devolvemos primeros N
  if (query?.destacada) {
    const destacadasFallback = result.filter((n) => n.destacada);
    if (destacadasFallback.length > 0) {
      result = destacadasFallback;
    } else {
      // No hay destacadas en fallback, usar primeras 2 como simulación o todas
      // Devolvemos slice según limit/pageSize
    }
  }
  // Paginación manual si page/pageSize/limit
  if (query?.limit !== undefined) {
    return result.slice(0, query.limit);
  }
  if (query?.page !== undefined || query?.pageSize !== undefined) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 6;
    const start = (page - 1) * pageSize;
    return result.slice(start, start + pageSize);
  }
  return result;
}

export const noticiasService = {
  async getNoticias(query?: NoticiasQuery): Promise<Noticia[]> {
    try {
      const filters: Record<string, any> = {};
      if (query?.destacada !== undefined) {
        filters.destacada = { $eq: query.destacada };
      }

      const pagination: Record<string, any> = {};
      if (query?.limit !== undefined) {
        pagination.pageSize = query.limit;
        pagination.page = 1;
      } else if (query?.page !== undefined || query?.pageSize !== undefined) {
        pagination.page = query.page ?? 1;
        pagination.pageSize = query.pageSize ?? 6;
      } else {
        pagination.pageSize = 100;
        pagination.page = 1;
      }

      const res = await fetchStrapi<StrapiCollectionResponse<any>>('/noticias', {
        params: {
          populate: {
            categoria: { fields: ['nombre', 'slug'] },
            portada: { fields: ['url', 'width', 'height', 'formats'] },
            galeria: { fields: ['url', 'width', 'height', 'formats'] },
          },
          sort: ['fechaPublicacion:desc', 'createdAt:desc'],
          ...(Object.keys(filters).length > 0 ? { filters } : {}),
          pagination,
          status: 'published',
        },
      });
      const data: any[] = (res as any).data ?? [];
      if (!Array.isArray(data) || data.length === 0) {
        // fallback con paginación manual si Strapi vacío
        return attachSource(applyFallbackPagination(noticiasFallback, query), 'fallback');
      }
      const mapped = data.map(mapStrapiNoticiaToNoticia);
      // Si no hay suficientes destacadas pero fallback espera 4, completar? No, devolver lo que hay
      if (mapped.length === 0) return attachSource(applyFallbackPagination(noticiasFallback, query), 'fallback');
      // Si query limit pero Strapi ya paginó, mapped ya está limitado
      return attachSource(mapped, 'strapi');
    } catch (err) {
      console.warn('[noticiasService.getNoticias] Strapi falla, usando fallback local:', err);
      return attachSource(applyFallbackPagination(noticiasFallback, query), 'fallback');
    }
  },

  async getNoticiasPaginated(query?: NoticiasQuery): Promise<PaginatedNoticias> {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? query?.limit ?? 6;
    try {
      const filters: Record<string, any> = {};
      if (query?.destacada !== undefined) {
        filters.destacada = { $eq: query.destacada };
      }
      const res = await fetchStrapi<StrapiCollectionResponse<any>>('/noticias', {
        params: {
          populate: {
            categoria: { fields: ['nombre', 'slug'] },
            portada: { fields: ['url', 'width', 'height', 'formats'] },
            galeria: { fields: ['url', 'width', 'height', 'formats'] },
          },
          sort: ['fechaPublicacion:desc', 'createdAt:desc'],
          ...(Object.keys(filters).length > 0 ? { filters } : {}),
          pagination: { page, pageSize },
          status: 'published',
        },
      });
      const data: any[] = (res as any).data ?? [];
      const meta = (res as any).meta ?? {};
      const rawPagination = meta?.pagination ?? { page, pageSize, pageCount: 1, total: data.length };
      if (!Array.isArray(data) || data.length === 0) {
        const fallbackSlice = applyFallbackPagination(noticiasFallback, { page, pageSize, destacada: query?.destacada });
        const total = query?.destacada
          ? noticiasFallback.filter((n) => n.destacada).length || noticiasFallback.length
          : noticiasFallback.length;
        return {
          data: fallbackSlice,
          pagination: {
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
            total,
          },
        };
      }
      const mapped = data.map(mapStrapiNoticiaToNoticia);
      return {
        data: mapped,
        pagination: {
          page: rawPagination.page ?? page,
          pageSize: rawPagination.pageSize ?? pageSize,
          pageCount: rawPagination.pageCount ?? Math.ceil((rawPagination.total ?? mapped.length) / pageSize),
          total: rawPagination.total ?? mapped.length,
        },
      };
    } catch (err) {
      console.warn('[noticiasService.getNoticiasPaginated] fallback:', err);
      const fallbackSlice = applyFallbackPagination(noticiasFallback, { page, pageSize, destacada: query?.destacada });
      const total = query?.destacada
        ? noticiasFallback.filter((n) => n.destacada).length || noticiasFallback.length
        : noticiasFallback.length;
      return {
        data: fallbackSlice,
        pagination: {
          page,
          pageSize,
          pageCount: Math.max(1, Math.ceil(total / pageSize)),
          total,
        },
      };
    }
  },

  async getNoticiaBySlug(slug: string): Promise<Noticia | undefined> {
    try {
      const res = await fetchStrapi<StrapiCollectionResponse<any>>('/noticias', {
        params: {
          filters: { slug: { $eq: slug } },
          populate: {
            categoria: { fields: ['nombre', 'slug'] },
            portada: { fields: ['url', 'width', 'height', 'formats'] },
            galeria: { fields: ['url', 'width', 'height', 'formats'] },
          },
          pagination: { pageSize: 1 },
          status: 'published',
        },
      });
      const data: any[] = (res as any).data ?? [];
      const raw = Array.isArray(data) ? data[0] : null;
      if (!raw) {
        const fb = noticiasFallback.find((n) => n.slug === slug);
        return fb ? attachSource(fb as any, 'fallback') : undefined;
      }
      return attachSource(mapStrapiNoticiaToNoticia(raw), 'strapi');
    } catch (err) {
      console.warn('[noticiasService.getNoticiaBySlug] fallback:', err);
      const fb = noticiasFallback.find((n) => n.slug === slug);
      return fb ? attachSource(fb as any, 'fallback') : undefined;
    }
  },

  async getNoticiasByCategoria(categoria: string): Promise<Noticia[]> {
    try {
      const slugCat = categoria.toLowerCase().replace(/\s+/g, '-');
      try {
        const res = await fetchStrapi<StrapiCollectionResponse<any>>('/noticias', {
          params: {
            filters: { categoria: { slug: { $eq: slugCat } } },
            populate: {
              categoria: { fields: ['nombre', 'slug'] },
              portada: { fields: ['url', 'width', 'height', 'formats'] },
            },
            sort: ['fechaPublicacion:desc'],
            pagination: { pageSize: 100 },
            status: 'published',
          },
        });
        const data: any[] = (res as any).data ?? [];
        if (Array.isArray(data) && data.length > 0) {
          return data.map(mapStrapiNoticiaToNoticia);
        }
      } catch {
        // fallback a filtrar por nombre
      }
      const todas = await this.getNoticias();
      const filtradas = todas.filter((n) => n.categoria.toLowerCase() === categoria.toLowerCase());
      return filtradas.length > 0 ? filtradas : noticiasFallback.filter((n) => n.categoria === categoria);
    } catch {
      return noticiasFallback.filter((n) => n.categoria === categoria);
    }
  },
};
