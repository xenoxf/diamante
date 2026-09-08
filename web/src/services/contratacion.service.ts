import type { Invitacion } from '../types/contratacion.types';
import { invitaciones as invitacionesFallback } from '../data/contratacion';
import { fetchStrapi } from '../lib/strapi';
import { mapStrapiInvitacionToLegacy } from '../lib/mappers';
import type { StrapiCollectionResponse } from '../lib/strapi-types';

export interface GetInvitacionesParams {
  pagination?: { page?: number; pageSize?: number };
  sort?: string[];
  filters?: Record<string, any>;
  estado?: string;
  año?: number | string;
}

export const contratacionService = {
  async getInvitaciones(params?: GetInvitacionesParams): Promise<Invitacion[]> {
    try {
      const pagination = params?.pagination ?? { pageSize: 100 };
      const sort = params?.sort ?? ['fechaPublicacion:desc', 'numero:desc'];
      const filters: Record<string, any> = { ...(params?.filters ?? {}) };
      if (params?.estado) {
        filters.estado = { $eq: params.estado };
      }
      if (params?.año) {
        // Filtrar por año de fechaPublicacion: usamos $gte y $lte
        const year = String(params.año);
        filters.fechaPublicacion = {
          $gte: `${year}-01-01`,
          $lte: `${year}-12-31`,
        };
      }

      const queryParams: Record<string, any> = {
        populate: {
          documento: { fields: ['url', 'mime', 'name'] },
        },
        sort,
        pagination,
        status: 'published',
      };
      if (Object.keys(filters).length > 0) {
        queryParams.filters = filters;
      }

      const res = await fetchStrapi<StrapiCollectionResponse<any>>('/invitaciones-contratacion', {
        params: queryParams,
      });
      const data: any[] = (res as any).data ?? [];
      if (!Array.isArray(data) || data.length === 0) {
        // Si hay filtros y no hay resultados, no fallback, devolver vacío para permitir UI vacía
        if (params && (params.estado || params.año || (params.filters && Object.keys(params.filters).length > 0))) {
          return [];
        }
        return invitacionesFallback;
      }
      return data.map(mapStrapiInvitacionToLegacy);
    } catch (err) {
      console.warn('[contratacionService.getInvitaciones] fallback:', err);
      // Si hay filtros, no enmascarar error con fallback completo, devolver vacío
      if (params && (params.estado || params.año)) return [];
      return invitacionesFallback;
    }
  },

  /**
   * Versión paginada que retorna data + meta para paginación real.
   */
  async getInvitacionesPaginado(
    params?: GetInvitacionesParams,
  ): Promise<{ data: Invitacion[]; meta: any }> {
    try {
      const pagination = params?.pagination ?? { page: 1, pageSize: 20 };
      const sort = params?.sort ?? ['fechaPublicacion:desc', 'numero:desc'];
      const filters: Record<string, any> = { ...(params?.filters ?? {}) };
      if (params?.estado) filters.estado = { $eq: params.estado };
      if (params?.año) {
        const year = String(params.año);
        filters.fechaPublicacion = { $gte: `${year}-01-01`, $lte: `${year}-12-31` };
      }
      const queryParams: Record<string, any> = {
        populate: { documento: { fields: ['url', 'mime', 'name'] } },
        sort,
        pagination,
        status: 'published',
      };
      if (Object.keys(filters).length > 0) queryParams.filters = filters;

      const res = await fetchStrapi<StrapiCollectionResponse<any>>('/invitaciones-contratacion', {
        params: queryParams,
      });
      const data: any[] = (res as any).data ?? [];
      const mapped = Array.isArray(data) ? data.map(mapStrapiInvitacionToLegacy) : [];
      return { data: mapped, meta: (res as any).meta ?? {} };
    } catch (err) {
      console.warn('[contratacionService.getInvitacionesPaginado] fallback:', err);
      const all = invitacionesFallback;
      // Paginación manual sobre fallback
      const page = params?.pagination?.page ?? 1;
      const pageSize = params?.pagination?.pageSize ?? 20;
      const start = (page - 1) * pageSize;
      const slice = all.slice(start, start + pageSize);
      return {
        data: slice,
        meta: {
          pagination: {
            page,
            pageSize,
            pageCount: Math.ceil(all.length / pageSize),
            total: all.length,
          },
        },
      };
    }
  },

  async getInvitacionByNumero(numero: string): Promise<Invitacion | undefined> {
    try {
      // Intentar filtro directo por numero
      try {
        const res = await fetchStrapi<StrapiCollectionResponse<any>>('/invitaciones-contratacion', {
          params: {
            filters: { numero: { $eq: numero } },
            populate: { documento: { fields: ['url', 'mime'] } },
            pagination: { pageSize: 1 },
            status: 'published',
          },
        });
        const data: any[] = (res as any).data ?? [];
        const raw = Array.isArray(data) ? data[0] : null;
        if (raw) return mapStrapiInvitacionToLegacy(raw);
      } catch {
        // fallback a lista
      }

      const all = await this.getInvitaciones();
      const found = all.find((i) => i.numero === numero);
      if (found) return found;
      return invitacionesFallback.find((i) => i.numero === numero);
    } catch {
      return invitacionesFallback.find((i) => i.numero === numero);
    }
  },
};
