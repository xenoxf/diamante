import type { Especialidad } from '../types/especialidad.types';
import { especialidades as especialidadesFallback } from '../data/especialidades';
import { fetchStrapi } from '../lib/strapi';
import { attachSource } from '../lib/data-source';
import { mapStrapiEspecialidadToEspecialidad } from '../lib/mappers';
import type { StrapiCollectionResponse } from '../lib/strapi-types';

export const especialidadesService = {
  async getEspecialidades(): Promise<Especialidad[]> {
    try {
      const res = await fetchStrapi<StrapiCollectionResponse<any>>('/especialidades', {
        params: {
          populate: {
            imagenes: { fields: ['url', 'width', 'height', 'formats'] },
            puntosDestacados: { populate: '*' },
          },
          sort: ['orden:asc', 'nombre:asc'],
          pagination: { pageSize: 100 },
          status: 'published',
        },
      });
      const data: any[] = (res as any).data ?? [];
      if (!Array.isArray(data) || data.length === 0) return attachSource(especialidadesFallback, 'fallback');
      return attachSource(data.map(mapStrapiEspecialidadToEspecialidad), 'strapi');
    } catch (err) {
      console.warn('[especialidadesService.getEspecialidades] fallback:', err);
      return attachSource(especialidadesFallback, 'fallback');
    }
  },

  async getEspecialidadBySlug(slug: string): Promise<Especialidad | undefined> {
    try {
      const res = await fetchStrapi<StrapiCollectionResponse<any>>('/especialidades', {
        params: {
          filters: { slug: { $eq: slug } },
          populate: {
            imagenes: { fields: ['url', 'width', 'height'] },
            puntosDestacados: { populate: '*' },
          },
          pagination: { pageSize: 1 },
          status: 'published',
        },
      });
      const data: any[] = (res as any).data ?? [];
      const raw = Array.isArray(data) ? data[0] : null;
      if (!raw) return especialidadesFallback.find((e) => e.slug === slug);
      return mapStrapiEspecialidadToEspecialidad(raw);
    } catch (err) {
      console.warn('[especialidadesService.getEspecialidadBySlug] fallback:', err);
      return especialidadesFallback.find((e) => e.slug === slug);
    }
  },
};
