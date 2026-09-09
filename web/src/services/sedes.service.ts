import type { Sede } from '../types/sede.types';
import { sedes as sedesFallback } from '../data/sedes';
import { fetchStrapi } from '../lib/strapi';
import { attachSource } from '../lib/data-source';
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
      if (!Array.isArray(data) || data.length === 0) return attachSource(sedesFallback, 'fallback');
      return attachSource(data.map(mapStrapiSedeToSede), 'strapi');
    } catch (err) {
      console.warn('[sedesService.getSedes] Strapi falla, fallback:', err);
      return attachSource(sedesFallback, 'fallback');
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
      if (!raw) {
        const fb = sedesFallback.find((s) => s.slug === slug);
        return fb ? attachSource(fb, 'fallback') : undefined;
      }
      return attachSource(mapStrapiSedeToSede(raw), 'strapi');
    } catch (err) {
      console.warn('[sedesService.getSedeBySlug] fallback:', err);
      const fb = sedesFallback.find((s) => s.slug === slug);
      return fb ? attachSource(fb as any, 'fallback') : undefined;
    }
  },
};
