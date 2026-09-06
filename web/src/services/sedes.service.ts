import type { Sede } from '../types/sede.types';
import { sedes as sedesFallback } from '../data/sedes';
import { fetchStrapi } from '../lib/strapi';
import { mapStrapiSedeToSede } from '../lib/mappers';
import type { StrapiCollectionResponse } from '../lib/strapi-types';

export const sedesService = {
  async getSedes(): Promise<Sede[]> {
    try {
      const res = await fetchStrapi<StrapiCollectionResponse<any>>('/sedes', {
        params: {
          populate: {
            imagenCard: { fields: ['url', 'width', 'height'] },
            banner: { fields: ['url', 'width', 'height'] },
          },
          sort: ['orden:asc', 'nombre:asc'],
          pagination: { pageSize: 100 },
          status: 'published',
        },
      });
      const data: any[] = (res as any).data ?? [];
      if (!Array.isArray(data) || data.length === 0) return sedesFallback;
      return data.map(mapStrapiSedeToSede);
    } catch (err) {
      console.warn('[sedesService.getSedes] Strapi falla, fallback:', err);
      return sedesFallback;
    }
  },

  async getSedeBySlug(slug: string): Promise<Sede | undefined> {
    try {
      const res = await fetchStrapi<StrapiCollectionResponse<any>>('/sedes', {
        params: {
          filters: { slug: { $eq: slug } },
          populate: {
            imagenCard: { fields: ['url', 'width', 'height'] },
            banner: { fields: ['url', 'width', 'height'] },
          },
          pagination: { pageSize: 1 },
          status: 'published',
        },
      });
      const data: any[] = (res as any).data ?? [];
      const raw = Array.isArray(data) ? data[0] : null;
      if (!raw) return sedesFallback.find((s) => s.slug === slug);
      return mapStrapiSedeToSede(raw);
    } catch (err) {
      console.warn('[sedesService.getSedeBySlug] fallback:', err);
      return sedesFallback.find((s) => s.slug === slug);
    }
  },
};
