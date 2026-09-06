import { fetchStrapi, getStrapiMediaUrl } from '../lib/strapi';
import type { StrapiConfiguracionGeneral, StrapiSingleResponse, StrapiSeo } from '../lib/strapi-types';
import { unwrapStrapiEntity } from '../lib/strapi';

export interface ConfiguracionGeneralLegacy {
  nombreInstitucion: string;
  emailInstitucional: string;
  telefonoPrincipal: string | null;
  direccionPrincipal: string | null;
  horarioAtencion: string | null;
  enlacesGobierno: Array<{ label: string; url: string; externo?: boolean; abrirEnNuevaPestana?: boolean }>;
  redesSociales: Array<{ plataforma: string; url: string }>;
  avisoLegalFooter: string | null;
  seoDefault: StrapiSeo | null;
  escudoUrl?: string | null;
  faviconUrl?: string | null;
}

const FALLBACK: ConfiguracionGeneralLegacy = {
  nombreInstitucion: 'Institución Educativa El Diamante',
  emailInstitucional: 'ie.eldiamante@cali.edu.co',
  telefonoPrincipal: '602 4260678',
  direccionPrincipal: 'Carrera 33 N° 41-00, barrio El Diamante, Cali',
  horarioAtencion: '<p>Lunes a viernes 7:00 - 15:00. Sedes: El Diamante, Juan Pablo II, Señor de los Milagros.</p>',
  enlacesGobierno: [
    { label: 'Transparencia', url: 'https://transparencia.cali.gov.co/', externo: true, abrirEnNuevaPestana: true },
    { label: 'Alcaldía de Cali', url: 'https://www.cali.gov.co/', externo: true, abrirEnNuevaPestana: true },
    { label: 'Secretaría de Educación', url: 'https://www.cali.gov.co/educacion/', externo: true, abrirEnNuevaPestana: true },
  ],
  redesSociales: [],
  avisoLegalFooter: '© 2026 Institución Educativa El Diamante · Santiago de Cali',
  seoDefault: null,
  escudoUrl: null,
  faviconUrl: null,
};

function mapStrapiConfigToLegacy(raw: any): ConfiguracionGeneralLegacy {
  const d = unwrapStrapiEntity<StrapiConfiguracionGeneral>(raw);
  if (!d) return FALLBACK;
  const escudoUrl = getStrapiMediaUrl((d as any).escudo);
  const faviconUrl = getStrapiMediaUrl((d as any).favicon);
  const seoDefault = (d as any).seoDefault ?? (d as any).seo ?? null;
  // Normalizar seo media
  let seo: StrapiSeo | null = null;
  if (seoDefault) {
    seo = unwrapStrapiEntity<StrapiSeo>(seoDefault);
    // media inside
    if ((seo as any)?.metaImage) {
      // keep as is, Layout will resolve url
    }
  }
  return {
    nombreInstitucion: d.nombreInstitucion ?? FALLBACK.nombreInstitucion,
    emailInstitucional: d.emailInstitucional ?? FALLBACK.emailInstitucional,
    telefonoPrincipal: d.telefonoPrincipal ?? FALLBACK.telefonoPrincipal,
    direccionPrincipal: d.direccionPrincipal ?? FALLBACK.direccionPrincipal,
    horarioAtencion: (d as any).horarioAtencion ?? FALLBACK.horarioAtencion,
    enlacesGobierno: Array.isArray((d as any).enlacesGobierno) ? (d as any).enlacesGobierno.map((e: any) => unwrapStrapiEntity<any>(e)) : FALLBACK.enlacesGobierno,
    redesSociales: Array.isArray((d as any).redesSociales) ? (d as any).redesSociales.map((e: any) => unwrapStrapiEntity<any>(e)) : [],
    avisoLegalFooter: (d as any).avisoLegalFooter ?? FALLBACK.avisoLegalFooter,
    seoDefault: seo,
    escudoUrl,
    faviconUrl,
  };
}

export const configuracionService = {
  fallback: FALLBACK,

  async getConfiguracion(): Promise<ConfiguracionGeneralLegacy> {
    try {
      const res = await fetchStrapi<StrapiSingleResponse<any>>('/configuracion-general', {
        params: {
          populate: {
            escudo: { fields: ['url', 'width', 'height'] },
            favicon: { fields: ['url', 'width', 'height'] },
            enlacesGobierno: { populate: '*' },
            redesSociales: { populate: '*' },
            seoDefault: { populate: { metaImage: { fields: ['url', 'width', 'height'] } } },
          },
          status: 'published',
        },
      });
      const data: any = (res as any).data ?? res;
      const unwrapped = data?.data ?? data;
      if (!unwrapped || (typeof unwrapped === 'object' && Object.keys(unwrapped).length === 0)) {
        return FALLBACK;
      }
      const mapped = mapStrapiConfigToLegacy(unwrapped);
      // Si no hay email, mantener fallback
      if (!mapped.emailInstitucional) return FALLBACK;
      return mapped;
    } catch (err) {
      console.warn('[configuracionService.getConfiguracion] fallback:', err);
      return FALLBACK;
    }
  },
};
