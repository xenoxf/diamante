import { fetchStrapi, getStrapiMediaUrl } from '../lib/strapi';
import { attachSource } from '../lib/data-source';
import type { StrapiSingleResponse } from '../lib/strapi-types';

export interface ConexionEnlace {
  id: string;
  label: string;
  url: string;
  icono?: string | null;
  externo?: boolean;
  abrirEnNuevaPestana?: boolean;
}

const fallbackEnlaces: ConexionEnlace[] = [
  {
    id: '1',
    label: 'Instagram',
    url: 'https://www.instagram.com/ieeldiamantecali/',
    icono: null,
    externo: true,
    abrirEnNuevaPestana: true,
  },
  {
    id: '2',
    label: 'Facebook',
    url: 'https://www.facebook.com/IEElDiamante/',
    icono: null,
    externo: true,
    abrirEnNuevaPestana: true,
  },
  {
    id: '3',
    label: 'YouTube',
    url: 'https://www.youtube.com/@InstitucionEducativaElDiaman',
    icono: null,
    externo: true,
    abrirEnNuevaPestana: true,
  },
  {
    id: '4',
    label: 'WhatsApp',
    url: 'https://chat.whatsapp.com/G2wFsFQOGCbLqEOYg0RWDH',
    icono: null,
    externo: true,
    abrirEnNuevaPestana: true,
  },
];

export const conexionesService = {
  async getConexiones(): Promise<ConexionEnlace[]> {
    try {
      const res = await fetchStrapi<StrapiSingleResponse<any>>('/pagina-conexiones', {
        params: {
          populate: {
            enlaces: '*',
          },
          status: 'published',
        },
      });
      const data: any = (res as any).data ?? res;
      const unwrapped = data?.data ?? data;
      const entity = unwrapped && typeof unwrapped === 'object' && !Array.isArray(unwrapped) ? unwrapped : null;

      if (!entity || !entity.enlaces || !Array.isArray(entity.enlaces) || entity.enlaces.length === 0) {
        return attachSource(fallbackEnlaces, 'fallback');
      }

      const enlaces: ConexionEnlace[] = entity.enlaces.map((e: any) => ({
        id: String(e.id ?? e.documentId ?? ''),
        label: e.label ?? '',
        url: e.url ?? '#',
        icono: e.icono ?? null,
        externo: e.externo ?? false,
        abrirEnNuevaPestana: e.abrirEnNuevaPestana ?? false,
      }));

      return attachSource(enlaces, 'strapi');
    } catch (err) {
      console.warn('[conexionesService.getConexiones] fallback:', err);
      return attachSource(fallbackEnlaces, 'fallback');
    }
  },
};