import type { CanalAtencion, EntradaDirectorio } from '../types/ciudadania.types';
import { canales as canalesFallback } from '../data/ciudadania';
import { sedesService } from './sedes.service';
import { fetchStrapi, getStrapiMediaUrl } from '../lib/strapi';
import { mapStrapiPaginaContactoToCanales } from '../lib/mappers';
import type { StrapiSingleResponse, StrapiSeo } from '../lib/strapi-types';
import { unwrapStrapiEntity } from '../lib/strapi';

export const EMAIL_INSTITUCIONAL = 'ie.eldiamante@cali.edu.co';
export const TRANSPARENCIA_URL = 'https://transparencia.cali.gov.co/';
export const PQR_EXTERNO_URL = 'https://www.cali.gov.co/';

export interface PaginaContactoData {
  titulo: string | null;
  introduccion: string | null;
  canales: CanalAtencion[];
  formularioActivo: boolean;
  seo: StrapiSeo | null;
}

const PAGINA_CONTACTO_FALLBACK: PaginaContactoData = {
  titulo: 'Contacto',
  introduccion:
    '<p>Para consultas académicas, administrativas o de convivencia, la comunidad puede comunicarse por los siguientes canales institucionales. La atención presencial se presta en el horario establecido por cada sede.</p>',
  canales: canalesFallback,
  formularioActivo: true,
  seo: null,
};

export const ciudadaniaService = {
  async getPaginaContacto(): Promise<PaginaContactoData> {
    try {
      const res = await fetchStrapi<StrapiSingleResponse<any>>('/pagina-contacto', {
        params: {
          populate: {
            canales: { populate: '*' },
            seo: { populate: { metaImage: { fields: ['url', 'width', 'height'] } } },
          },
          status: 'published',
        },
      });
      const data: any = (res as any).data ?? res;
      const unwrapped = data?.data ?? data;
      const entity = unwrapped?.data ?? unwrapped;
      const flat = unwrapStrapiEntity<any>(entity);
      if (!flat || (typeof flat === 'object' && Object.keys(flat).length === 0)) {
        return PAGINA_CONTACTO_FALLBACK;
      }
      const canales = mapStrapiPaginaContactoToCanales(flat);
      const seoRaw = (flat as any).seo ?? null;
      const seo = seoRaw ? unwrapStrapiEntity<StrapiSeo>(seoRaw) : null;
      return {
        titulo: (flat as any).titulo ?? PAGINA_CONTACTO_FALLBACK.titulo,
        introduccion: (flat as any).introduccion ?? PAGINA_CONTACTO_FALLBACK.introduccion,
        canales: canales.length > 0 ? canales : canalesFallback,
        formularioActivo: (flat as any).formularioActivo ?? true,
        seo,
      };
    } catch (err) {
      console.warn('[ciudadaniaService.getPaginaContacto] fallback:', err);
      return PAGINA_CONTACTO_FALLBACK;
    }
  },

  async getCanales(): Promise<CanalAtencion[]> {
    try {
      const pagina = await ciudadaniaService.getPaginaContacto();
      if (pagina.canales.length > 0) return pagina.canales;
      return canalesFallback;
    } catch (err) {
      console.warn('[ciudadaniaService.getCanales] fallback:', err);
      return canalesFallback;
    }
  },

  async getDirectorio(): Promise<EntradaDirectorio[]> {
    try {
      const sedes = await sedesService.getSedes();
      // Filtrar principal y generar directorio similar a legacy
      return [
        {
          dependencia: 'Rectoría',
          sede: 'Sede El Diamante (Principal)',
          telefono: '602 4260678',
          email: EMAIL_INSTITUCIONAL,
        },
        ...sedes
          .filter((s) => s.slug !== 'el-diamante')
          .map((s) => ({
            dependencia: `Coordinación ${s.nombre}`,
            sede: s.nombre,
            telefono: s.telefono,
            email: s.email,
          })),
      ];
    } catch (err) {
      console.warn('[ciudadaniaService.getDirectorio] fallback:', err);
      // Fallback a datos estáticos si sedes falla
      const sedesLocal = await sedesService.getSedes().catch(() => []);
      if (sedesLocal.length === 0) {
        return [
          {
            dependencia: 'Rectoría',
            sede: 'Sede El Diamante (Principal)',
            telefono: '602 4260678',
            email: EMAIL_INSTITUCIONAL,
          },
          {
            dependencia: 'Coordinación Sede Juan Pablo II',
            sede: 'Sede Juan Pablo II',
            telefono: '602 4376986',
            email: EMAIL_INSTITUCIONAL,
          },
          {
            dependencia: 'Coordinación Sede Señor de los Milagros',
            sede: 'Sede Señor de los Milagros',
            telefono: '302 543 3862',
            email: EMAIL_INSTITUCIONAL,
          },
        ];
      }
      return [
        {
          dependencia: 'Rectoría',
          sede: 'Sede El Diamante (Principal)',
          telefono: '602 4260678',
          email: EMAIL_INSTITUCIONAL,
        },
        ...sedesLocal
          .filter((s) => s.slug !== 'el-diamante')
          .map((s) => ({
            dependencia: `Coordinación ${s.nombre}`,
            sede: s.nombre,
            telefono: s.telefono,
            email: s.email,
          })),
      ];
    }
  },
};
