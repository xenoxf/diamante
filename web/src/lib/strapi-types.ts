/**
 * Tipos TypeScript para respuestas de Strapi 5 + mapeo a entidades del proyecto Diamante.
 * Respuesta base Strapi 5:
 *  - Collection: { data: T[], meta: { pagination: { page, pageSize, pageCount, total } } }
 *  - Single:     { data: T, meta: {} }
 *  - Error:      { error: { status, name, message, details } }
 *
 * Cada entidad viene aplanada (sin `attributes` wrapper) y con documentId.
 * Se provee compat con Strapi 4 vía utils unwrap.
 */

// ---------------------------------------------------------------------------
// Base Strapi
// ---------------------------------------------------------------------------

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiMeta {
  pagination?: StrapiPagination;
}

export interface StrapiCollectionResponse<T> {
  data: T[];
  meta: StrapiMeta;
}

export interface StrapiSingleResponse<T> {
  data: T | null;
  meta: StrapiMeta;
}

export type StrapiResponse<T> = StrapiCollectionResponse<T> | StrapiSingleResponse<T>;

export interface StrapiError {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}

// Entidad base con timestamps Strapi
export interface StrapiBaseEntity {
  id?: number;
  documentId: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  locale?: string | null;
}

// Media (upload file)
export interface StrapiMedia extends StrapiBaseEntity {
  name: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: Record<string, StrapiMediaFormat> | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string | null;
  provider: string;
  provider_metadata?: any;
}

export interface StrapiMediaFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path?: string | null;
  size: number;
  width: number;
  height: number;
  sizeInBytes?: number;
}

// SEO component
export interface StrapiSeo {
  id?: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  metaImage?: StrapiMedia | null;
  canonicalURL?: string;
  noIndex?: boolean;
}

// Shared components
export interface StrapiEnlace {
  id?: number;
  label: string;
  url: string;
  externo?: boolean;
  abrirEnNuevaPestana?: boolean;
}

export interface StrapiCanalAtencion {
  id?: number;
  nombre: string;
  detalle: string;
  icono?: string;
}

export interface StrapiRedSocial {
  id?: number;
  plataforma: 'facebook' | 'instagram' | 'youtube' | 'twitter' | 'tiktok';
  url: string;
}

export interface StrapiCarruselConfig {
  id?: number;
  autoplayMs?: number;
  transitionMs?: number;
}

export interface StrapiPuntoEspecialidad {
  id?: number;
  texto: string;
}

export interface StrapiValorInstitucional {
  id?: number;
  titulo: string;
  descripcion: string;
  orden?: number;
}

export interface StrapiListaUtilesItem {
  id?: number;
  grado: string;
  descripcion: string;
}

// ---------------------------------------------------------------------------
// Content Types específicos (Strapi 5 flat)
// ---------------------------------------------------------------------------

export interface StrapiCategoriaNoticia extends StrapiBaseEntity {
  nombre: string;
  slug: string;
  descripcion?: string | null;
  color?: string | null;
}

export interface StrapiCategoriaGaleria extends StrapiBaseEntity {
  nombre: string;
  slug: string;
}

export interface StrapiNoticia extends StrapiBaseEntity {
  titulo: string;
  slug: string;
  resumen: string;
  contenido: string; // richtext HTML
  categoria?: StrapiCategoriaNoticia | null;
  portada?: StrapiMedia | null;
  galeria?: StrapiMedia[] | null;
  documentoAdjunto?: StrapiMedia | null;
  destacada?: boolean;
  fechaPublicacion: string; // date (YYYY-MM-DD)
  seo?: StrapiSeo | null;
}

export interface StrapiSede extends StrapiBaseEntity {
  nombre: string;
  slug: string;
  barrio: string;
  direccion: string;
  telefono: string;
  email: string;
  mapQuery: string;
  imagenCard?: StrapiMedia | null;
  banner?: StrapiMedia | null;
  orden: number;
  horarioAtencion?: string | null;
  seo?: StrapiSeo | null;
}

export interface StrapiEspecialidad extends StrapiBaseEntity {
  nombre: string;
  slug: string;
  contenido?: string;
  imagenes?: StrapiMedia[] | null;
  documentos?: StrapiMedia[] | null;
  orden?: number;
  seo?: StrapiSeo | null;
}

export interface StrapiGaleriaItem extends StrapiBaseEntity {
  titulo: string;
  descripcion?: string | null;
  imagen?: StrapiMedia | null;
  categoria?: StrapiCategoriaGaleria | null;
  fechaEvento?: string | null;
  sede?: StrapiSede | null;
  destacadoHome?: boolean;
  orden?: number;
}

export interface StrapiDocumentoInstitucional extends StrapiBaseEntity {
  titulo: string;
  slug: string;
  descripcion: string;
  categoria: 'PEI' | 'Convivencia' | 'Ambiental' | 'Admisiones' | 'Organizacion' | 'Otro';
  archivo?: StrapiMedia | null;
  urlExterna?: string | null;
  formato: 'PDF' | 'Imagen' | 'Enlace';
  fechaActualizacion?: string | null;
  version?: string | null;
  seo?: StrapiSeo | null;
}

export interface StrapiInvitacionContratacion extends StrapiBaseEntity {
  numero: string;
  slug: string;
  objeto: string;
  fechaPublicacion: string;
  fechaCierre?: string | null;
  montoEstimado?: string | null;
  estado: 'abierta' | 'cerrada' | 'adjudicada' | 'desierta';
  documento?: StrapiMedia | null;
  documentoUrl?: string | null;
  enlacesExternos?: StrapiEnlace[] | null;
}

export interface StrapiSlideCarrusel extends StrapiBaseEntity {
  titulo?: string | null;
  imagen?: StrapiMedia | null;
  alt: string;
  /** @deprecated usar botonUrl */
  enlace?: string | null;
  botonUrl?: string | null;
  botonTexto?: string | null;
  tituloOverlay?: string | null;
  descripcionOverlay?: string | null;
  fuente?: 'manual' | 'galeria_item' | null;
  galeria_item?: StrapiGaleriaItem | null;
  abrirEnNuevaPestana?: boolean | null;
  orden: number;
  activo?: boolean;
}

// Single Types

export interface StrapiPaginaIdentidad extends StrapiBaseEntity {
  mision: string;
  misionImagen?: StrapiMedia | null;
  vision: string;
  visionImagen?: StrapiMedia | null;
  valoresIntroduccion?: string | null;
  valoresImagen?: StrapiMedia | null;
  valores?: StrapiValorInstitucional[] | null;
  organigrama?: StrapiMedia | null;
  organigramaDescripcion?: string | null;
  seo?: StrapiSeo | null;
}

export interface StrapiPaginaContacto extends StrapiBaseEntity {
  titulo?: string | null;
  introduccion?: string | null;
  canales?: StrapiCanalAtencion[] | null;
  formularioActivo?: boolean;
  seo?: StrapiSeo | null;
}

export interface StrapiConfiguracionGeneral extends StrapiBaseEntity {
  nombreInstitucion: string;
  escudo?: StrapiMedia | null;
  favicon?: StrapiMedia | null;
  emailInstitucional: string;
  telefonoPrincipal?: string | null;
  direccionPrincipal?: string | null;
  horarioAtencion?: string | null;
  enlacesGobierno?: StrapiEnlace[] | null;
  redesSociales?: StrapiRedSocial[] | null;
  avisoLegalFooter?: string | null;
  seoDefault?: StrapiSeo | null;
}

export interface StrapiPaginaInicio extends StrapiBaseEntity {
  tituloHero?: string | null;
  carruselConfig?: StrapiCarruselConfig | null;
  heroSlides?: StrapiSlideCarrusel[] | null;
  seo?: StrapiSeo | null;
}

export interface StrapiPaginaAdmisiones extends StrapiBaseEntity {
  introduccion: string;
  requisitos?: string | null;
  notaAclaratoria?: string | null;
  listasUtiles?: StrapiListaUtilesItem[] | null;
  seo?: StrapiSeo | null;
}
