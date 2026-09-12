import { fetchStrapi, getStrapiMediaUrl } from '../lib/strapi';
import { attachSource } from '../lib/data-source';
import type { StrapiSingleResponse } from '../lib/strapi-types';

export interface InvitacionesHomeData {
  imagenUrl: string | null;
  textoAlternativo: string | null;
  enlace: string;
}

const fallbackData: InvitacionesHomeData = {
  imagenUrl: 'https://www.ie-eldiamantecali.edu.co/wp-content/uploads/2025/09/I.E.-El-Diamante-Cali-1920-x-700-px-1024x373.png',
  textoAlternativo: null,
  enlace: '/contratacion',
};

export const invitacionesHomeService = {
  async getInvitacionesHome(): Promise<InvitacionesHomeData> {
    try {
      const res = await fetchStrapi<StrapiSingleResponse<any>>('/pagina-invitaciones-home', {
        params: {
          populate: {
            imagen: { fields: ['url', 'width', 'height'] },
          },
          status: 'published',
        },
      });
      const data: any = (res as any).data ?? res;
      const unwrapped = data?.data ?? data;
      const entity = unwrapped && typeof unwrapped === 'object' && !Array.isArray(unwrapped) ? unwrapped : null;

      if (!entity || (!entity.imagen && !entity.textoAlternativo)) {
        return attachSource(fallbackData, 'fallback');
      }

      const result: InvitacionesHomeData = {
        imagenUrl: getStrapiMediaUrl(entity.imagen) ?? fallbackData.imagenUrl,
        textoAlternativo: entity.textoAlternativo ?? null,
        enlace: entity.enlace ?? fallbackData.enlace,
      };

      return attachSource(result, 'strapi');
    } catch (err) {
      console.warn('[invitacionesHomeService.getInvitacionesHome] fallback:', err);
      return attachSource(fallbackData, 'fallback');
    }
  },
};