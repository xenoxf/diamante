import type { DocumentoInstitucional } from '../types/institucional.types';
import { documentos as documentosFallback } from '../data/institucional';
import { fetchStrapi } from '../lib/strapi';
import { mapStrapiDocumentoToLegacy } from '../lib/mappers';
import type { StrapiCollectionResponse } from '../lib/strapi-types';

export const institucionalService = {
  async getDocumentos(): Promise<DocumentoInstitucional[]> {
    try {
      const res = await fetchStrapi<StrapiCollectionResponse<any>>('/documentos-institucionales', {
        params: {
          populate: {
            archivo: { fields: ['url', 'mime', 'name'] },
          },
          sort: ['titulo:asc'],
          pagination: { pageSize: 100 },
          status: 'published',
        },
      });
      const data: any[] = (res as any).data ?? [];
      if (!Array.isArray(data) || data.length === 0) return documentosFallback;
      return data.map(mapStrapiDocumentoToLegacy);
    } catch (err) {
      console.warn('[institucionalService.getDocumentos] fallback:', err);
      return documentosFallback;
    }
  },

  async getDocumentoBySlug(slug: string): Promise<DocumentoInstitucional | undefined> {
    try {
      try {
        const res = await fetchStrapi<StrapiCollectionResponse<any>>('/documentos-institucionales', {
          params: {
            filters: { slug: { $eq: slug } },
            populate: { archivo: { fields: ['url', 'mime', 'name'] } },
            pagination: { pageSize: 1 },
            status: 'published',
          },
        });
        const data: any[] = (res as any).data ?? [];
        const raw = Array.isArray(data) ? data[0] : null;
        if (raw) return mapStrapiDocumentoToLegacy(raw);
      } catch {
        // ignore, fallback a getDocumentos
      }

      const docs = await this.getDocumentos();
      const found = docs.find((d) => d.id === slug);
      if (found) return found;
      return documentosFallback.find((d) => d.id === slug);
    } catch {
      return documentosFallback.find((d) => d.id === slug);
    }
  },

  async getDocumentoById(id: string): Promise<DocumentoInstitucional | undefined> {
    return this.getDocumentoBySlug(id);
  },
};
