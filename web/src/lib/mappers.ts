/**
 * Mappers: convierten respuestas Strapi (flat, con relaciones populadas) a tipos legacy
 * usados en páginas y componentes (Noticia, Sede, Especialidad, etc.).
 *
 * Compatibilidad: Soporta tanto Strapi 5 flat como Strapi 4 attributes wrapper
 * mediante unwrapStrapiEntity.
 */

import { getStrapiMediaUrl, unwrapStrapiEntity } from './strapi';
import type {
  StrapiCategoriaGaleria,
  StrapiCategoriaNoticia,
  StrapiDocumentoInstitucional,
  StrapiEspecialidad,
  StrapiGaleriaItem,
  StrapiInvitacionContratacion,
  StrapiNoticia,
  StrapiPaginaContacto,
  StrapiPaginaIdentidad,
  StrapiSede,
  StrapiSlideCarrusel,
} from './strapi-types';

import type { Noticia } from '../types/noticia.types';
import type { Sede } from '../types/sede.types';
import type { Especialidad } from '../types/especialidad.types';
import type { GaleriaItem } from '../types/galeria.types';
import type { IdentidadCard } from '../types/identidad.types';
import type { DocumentoInstitucional } from '../types/institucional.types';
import type { Invitacion } from '../types/contratacion.types';
import type { CanalAtencion } from '../types/ciudadania.types';
import type { CarruselSlide } from '../types/carrusel.types';
import type { GalleryImage, LandscapeSlide } from '../types/landscape.types';

// ---------------------------------------------------------------------------
// Helpers genéricos
// ---------------------------------------------------------------------------

function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatFechaStrapi(iso: string | null | undefined): string {
  if (!iso) return '';
  // Strapi date es YYYY-MM-DD; convertir a Date UTC
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  // Usar fecha UTC para evitar desfase timezone; crear a partir de partes
  // Si es YYYY-MM-DD, forzar UTC midday
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, day] = iso.split('-').map(Number);
    const utc = new Date(Date.UTC(y!, m! - 1, day!, 12));
    try {
      return new Intl.DateTimeFormat('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(utc);
    } catch {
      return `${day} de ${utc.toLocaleString('es', { month: 'long' })} de ${y}`;
    }
  }
  try {
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return iso;
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function unwrapRelation<T>(maybe: any): T | null {
  if (!maybe) return null;
  // Puede venir como { data: {...} } (Strapi 4)
  if (maybe.data) {
    return unwrapStrapiEntity<T>(maybe.data);
  }
  // Ya es entity flat
  return unwrapStrapiEntity<T>(maybe);
}

// ---------------------------------------------------------------------------
// Noticia
// ---------------------------------------------------------------------------

export function mapStrapiNoticiaToNoticia(raw: any): Noticia {
  const d = unwrapStrapiEntity<StrapiNoticia>(raw);
  const cat = unwrapRelation<StrapiCategoriaNoticia>(d.categoria);
  // Fallback si categoría no populada pero hay string antiguo
  const categoriaNombre =
    cat?.nombre ??
    (typeof (d as any).categoria === 'string' ? (d as any).categoria : null) ??
    'Institucional';

  const categoriaSlug = cat?.slug ?? (typeof (d as any).categoria === 'string' ? slugify((d as any).categoria) : null) ?? null;

  const fechaRaw = (d as any).fechaPublicacion ?? (d as any).fecha ?? null;
  const fecha = fechaRaw ? formatFechaStrapi(fechaRaw) : '';

  const portadaUrl = getStrapiMediaUrl((d as any).portada ?? (d as any).imagen ?? null);
  const galeriaRaw: any = (d as any).galeria ?? null;
  let galeriaUrls: string[] = [];
  if (galeriaRaw) {
    if (Array.isArray(galeriaRaw)) {
      galeriaUrls = galeriaRaw.map((m: any) => getStrapiMediaUrl(m)).filter((u: any): u is string => !!u);
    } else if ((galeriaRaw as any).data && Array.isArray((galeriaRaw as any).data)) {
      galeriaUrls = (galeriaRaw as any).data.map((m: any) => getStrapiMediaUrl(m)).filter((u: any) => !!u);
    } else {
      const single = getStrapiMediaUrl(galeriaRaw);
      if (single) galeriaUrls = [single];
    }
  }

  return {
    slug: d.slug ?? slugify(d.titulo ?? ''),
    titulo: d.titulo ?? '',
    fecha,
    categoria: categoriaNombre,
    resumen: d.resumen ?? stripHtml((d as any).contenido ?? '').slice(0, 280),
    contenido: (d as any).contenido ?? '',
    portadaUrl: portadaUrl ?? null,
    galeriaUrls,
    destacada: !!(d as any).destacada,
    fechaRaw,
    categoriaSlug,
  };
}

export function mapStrapiNoticiasToLegacy(list: any[]): Noticia[] {
  if (!Array.isArray(list)) return [];
  return list.map(mapStrapiNoticiaToNoticia);
}

// ---------------------------------------------------------------------------
// Sede
// ---------------------------------------------------------------------------

function legacySedeImgFallback(slug: string): string {
  const map: Record<string, string> = {
    'el-diamante': '/sedes/sede_principal.png',
    'juan-pablo-ii': '/sedes/sede_juan_pablo.png',
    'senor-de-los-milagros': '/sedes/sede_retiro.png',
  };
  return map[slug] ?? `/sedes/${slug}.png`;
}

export function mapStrapiSedeToSede(raw: any): Sede {
  const d = unwrapStrapiEntity<StrapiSede>(raw);
  const imagenCardUrl = getStrapiMediaUrl((d as any).imagenCard ?? (d as any).imagen_card ?? (d as any).imagen);
  const bannerUrl = getStrapiMediaUrl((d as any).banner);

  // Soportar campo legacy imgPath si ya viene
  const imgPath = imagenCardUrl ?? (d as any).imgPath ?? legacySedeImgFallback(d.slug);

  return {
    slug: d.slug,
    nombre: d.nombre,
    barrio: d.barrio ?? '',
    direccion: d.direccion ?? '',
    telefono: d.telefono ?? '',
    email: d.email ?? 'ie.eldiamante@cali.edu.co',
    mapQuery: (d as any).mapQuery ?? d.direccion ?? '',
    imgPath,
    bannerUrl: bannerUrl ?? (d as any).bannerUrl ?? undefined,
    horarioAtencion: (d as any).horarioAtencion ?? null,
    imagenCardUrl: imagenCardUrl ?? null,
  };
}

export function mapStrapiSedesToLegacy(list: any[]): Sede[] {
  if (!Array.isArray(list)) return [];
  return list.map(mapStrapiSedeToSede).sort((a, b) => {
    // Intentar ordenar por campo orden si disponible en raw
    return 0;
  });
}

// ---------------------------------------------------------------------------
// Especialidad
// ---------------------------------------------------------------------------

export function mapStrapiEspecialidadToEspecialidad(raw: any): Especialidad {
  const d = unwrapStrapiEntity<StrapiEspecialidad>(raw);

  const imagenesRaw: any = (d as any).imagenes ?? (d as any).imagen ?? null;
  let images: string[] = [];
  if (imagenesRaw) {
    if (Array.isArray(imagenesRaw)) {
      images = imagenesRaw.map((m) => getStrapiMediaUrl(m)).filter((u): u is string => !!u);
    } else if ((imagenesRaw as any).data && Array.isArray((imagenesRaw as any).data)) {
      images = (imagenesRaw as any).data.map((m: any) => getStrapiMediaUrl(m)).filter((u: any) => !!u);
    } else {
      const single = getStrapiMediaUrl(imagenesRaw);
      if (single) images = [single];
    }
  }
  if (images.length === 0) {
    images = [`/tecnica/${d.slug}/${d.slug}_1.jpeg`];
  }

  const documentosRaw: any = (d as any).documentos ?? null;
  let documentos: { id: string; name: string; url: string; mime: string }[] = [];
  if (documentosRaw) {
    const docs = Array.isArray(documentosRaw) ? documentosRaw : (documentosRaw?.data ? documentosRaw.data : [documentosRaw]);
    documentos = docs.map((m: any) => {
      const url = getStrapiMediaUrl(m);
      const entity = m?.attributes ?? m;
      return {
        id: String(m?.id ?? entity?.id ?? ''),
        name: entity?.name ?? entity?.alternativeText ?? 'documento',
        url: url ?? '',
        mime: entity?.mime ?? '',
      };
    }).filter((d: any) => d.url);
  }

  return {
    slug: d.slug,
    nombre: d.nombre,
    contenido: (d as any).contenido ?? (d as any).descripcion ?? '',
    images,
    documentos,
    duracion: (d as any).duracion ?? null,
    orden: (d as any).orden ?? 0,
  };
}

export function mapStrapiEspecialidadesToLegacy(list: any[]): Especialidad[] {
  if (!Array.isArray(list)) return [];
  return list.map(mapStrapiEspecialidadToEspecialidad);
}

// ---------------------------------------------------------------------------
// Galería
// ---------------------------------------------------------------------------

export function mapStrapiGaleriaItemToLegacy(raw: any): GaleriaItem {
  const d = unwrapStrapiEntity<StrapiGaleriaItem>(raw);
  const cat = unwrapRelation<StrapiCategoriaGaleria>(d.categoria);
  const categoriaNombre =
    cat?.nombre ??
    (typeof (d as any).categoria === 'string' ? (d as any).categoria : 'General');

  const id = (d as any).documentId ?? String((d as any).id ?? d.titulo);

  return {
    id: String(id),
    titulo: d.titulo,
    categoria: categoriaNombre,
  };
}

export function mapStrapiGaleriaItemToGalleryImage(raw: any): GalleryImage | null {
  const d = unwrapStrapiEntity<StrapiGaleriaItem>(raw);
  const media: any = (d as any).imagen ?? (d as any).imagenCard ?? null;
  const src = getStrapiMediaUrl(media);
  if (!src) return null;

  // Intentar obtener dimensiones reales de la media
  let width = 800;
  let height = 600;
  const mediaUnwrapped = unwrapStrapiEntity<any>(media);
  const dims = mediaUnwrapped as any;
  if (dims?.width && dims?.height) {
    width = dims.width;
    height = dims.height;
  } else if (dims?.attributes?.width && dims?.attributes?.height) {
    width = dims.attributes.width;
    height = dims.attributes.height;
  } else if (media?.data?.attributes?.width) {
    width = media.data.attributes.width;
    height = media.data.attributes.height;
  }

  // Fallback ratios si no hay dims
  if (!width || !height) {
    width = 600;
    height = 800;
  }

  const id = (d as any).documentId ?? String((d as any).id ?? src);
  const cat = unwrapRelation<StrapiCategoriaGaleria>((d as any).categoria);
  const categoriaNombre = cat?.nombre ?? (typeof (d as any).categoria === 'string' ? (d as any).categoria : undefined);

  return {
    id: String(id),
    src,
    width,
    height,
    alt: (d as any).descripcion ?? d.titulo ?? '',
    href: '/galeria',
    titulo: d.titulo,
    categoria: categoriaNombre,
  };
}

export function mapStrapiGaleriaToGalleryImages(list: any[]): GalleryImage[] {
  if (!Array.isArray(list)) return [];
  return list
    .map(mapStrapiGaleriaItemToGalleryImage)
    .filter((x): x is GalleryImage => x !== null);
}

// ---------------------------------------------------------------------------
// Identidad (single type pagina-identidad -> IdentidadCard[])
// ---------------------------------------------------------------------------

export function mapStrapiPaginaIdentidadToCards(raw: any): IdentidadCard[] {
  const d = unwrapStrapiEntity<StrapiPaginaIdentidad>(raw);
  if (!d) return [];

  const cards: IdentidadCard[] = [];

  const misionImg = getStrapiMediaUrl((d as any).misionImagen) ?? '/identidad/mision.png';
  const visionImg = getStrapiMediaUrl((d as any).visionImagen) ?? '/identidad/vision.png';
  const valoresImg = getStrapiMediaUrl((d as any).valoresImagen) ?? '/identidad/valores.png';
  const organigramaMedia = getStrapiMediaUrl((d as any).organigrama);

  cards.push({
    id: 'mision',
    titulo: 'Misión',
    texto: stripHtml((d as any).mision ?? ''),
    imgPath: misionImg,
    href: '/mision',
  });

  cards.push({
    id: 'vision',
    titulo: 'Visión',
    texto: stripHtml((d as any).vision ?? ''),
    imgPath: visionImg,
    href: '/vision',
  });

  // Valores: puede venir como texto intro + lista; usamos intro + lista concatenada
  const valoresIntro = (d as any).valoresIntroduccion ?? '';
  const valoresList: any[] = (d as any).valores ?? [];
  let valoresTexto = stripHtml(valoresIntro);
  if (valoresList.length > 0) {
    const valoresDescripciones = valoresList
      .map((v: any) => {
        const vv = unwrapStrapiEntity<any>(v);
        const titulo = vv.titulo ? `${vv.titulo}: ` : '';
        const desc = vv.descripcion ?? '';
        return `${titulo}${desc}`;
      })
      .join(' ');
    if (valoresDescripciones) {
      valoresTexto = valoresTexto ? `${valoresTexto} ${valoresDescripciones}` : valoresDescripciones;
    }
  }
  if (!valoresTexto) valoresTexto = 'Pensamiento crítico, identidad y pertenencia, trabajo en equipo, creatividad e inclusión social.';

  cards.push({
    id: 'valores',
    titulo: 'Valores Institucionales',
    texto: valoresTexto,
    imgPath: valoresImg,
    href: '/valores-institucionales',
  });

  const organigramaTexto = stripHtml((d as any).organigramaDescripcion ?? '') ||
    'La institución cuenta con una estructura organizacional encabezada por la Rectoría, apoyada por las coordinaciones, el consejo directivo y los órganos de participación de la comunidad educativa.';

  cards.push({
    id: 'organigrama',
    titulo: 'Organigrama',
    texto: organigramaTexto,
    imgPath: organigramaMedia ?? '/identidad/organigrama.png',
    href: '/organigrama',
  });

  return cards;
}

// ---------------------------------------------------------------------------
// Documento Institucional
// ---------------------------------------------------------------------------

export function mapStrapiDocumentoToLegacy(raw: any): DocumentoInstitucional {
  const d = unwrapStrapiEntity<StrapiDocumentoInstitucional>(raw);
  const archivoUrl = getStrapiMediaUrl((d as any).archivo);
  const url = archivoUrl ?? (d as any).urlExterna ?? (d as any).url ?? '#';

  // Formato puede venir como enum; legacy usa 'PDF' | 'Imagen' | 'Enlace'
  let formato: DocumentoInstitucional['formato'] = 'PDF';
  const rawFormato = (d as any).formato;
  if (rawFormato === 'Imagen' || rawFormato === 'Enlace' || rawFormato === 'PDF') {
    formato = rawFormato;
  } else if (url && url.endsWith('.pdf')) {
    formato = 'PDF';
  } else if (url && (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg'))) {
    formato = 'Imagen';
  } else if (url && url.startsWith('http')) {
    formato = 'Enlace';
  }

  // Determinar id legacy: slug coincide con ids locales (manual-convivencia, pei, etc.)
  const id = (d as any).slug ?? (d as any).documentId ?? String((d as any).id ?? d.titulo);

  return {
    id: String(id),
    titulo: d.titulo,
    descripcion: (d as any).descripcion ?? '',
    url,
    formato,
  };
}

export function mapStrapiDocumentosToLegacy(list: any[]): DocumentoInstitucional[] {
  if (!Array.isArray(list)) return [];
  return list.map(mapStrapiDocumentoToLegacy);
}

// ---------------------------------------------------------------------------
// Invitación Contratación
// ---------------------------------------------------------------------------

export function mapStrapiInvitacionToLegacy(raw: any): Invitacion {
  const d = unwrapStrapiEntity<StrapiInvitacionContratacion>(raw);
  const documentoMediaUrl = getStrapiMediaUrl((d as any).documento);
  const documentoUrl = documentoMediaUrl ?? (d as any).documentoUrl ?? (d as any).documento_url ?? undefined;

  const fechaRaw: string | undefined = (d as any).fechaPublicacion ?? (d as any).fecha ?? undefined;
  const fecha = formatFechaStrapi(fechaRaw);

  return {
    numero: d.numero,
    objeto: (d as any).objeto ?? '',
    fecha,
    fechaPublicacion: fechaRaw,
    estado: (d as any).estado ?? 'cerrada',
    slug: (d as any).slug ?? slugify(d.numero ?? ''),
    documentoUrl: documentoUrl || undefined,
    documentoMediaUrl,
  };
}

export function mapStrapiInvitacionesToLegacy(list: any[]): Invitacion[] {
  if (!Array.isArray(list)) return [];
  return list.map(mapStrapiInvitacionToLegacy);
}

// ---------------------------------------------------------------------------
// Canales (Ciudadanía)
// ---------------------------------------------------------------------------

export function mapStrapiCanalToLegacy(raw: any, idx: number): CanalAtencion {
  const d = unwrapStrapiEntity<any>(raw);
  const nombre = d.nombre ?? d.label ?? `Canal ${idx + 1}`;
  const detalle = d.detalle ?? d.descripcion ?? '';
  const id = slugify(nombre) || `canal-${idx}`;

  return {
    id,
    nombre,
    detalle,
  };
}

export function mapStrapiPaginaContactoToCanales(raw: any): CanalAtencion[] {
  const d = unwrapStrapiEntity<StrapiPaginaContacto>(raw);
  const canalesRaw: any[] = (d as any)?.canales ?? [];
  if (!Array.isArray(canalesRaw) || canalesRaw.length === 0) return [];
  return canalesRaw.map((c, i) => mapStrapiCanalToLegacy(c, i));
}

// ---------------------------------------------------------------------------
// Slides Carrusel
// ---------------------------------------------------------------------------

export function mapStrapiSlideToCarruselSlide(raw: any): CarruselSlide | null {
  const d = unwrapStrapiEntity<StrapiSlideCarrusel>(raw);

  // Resolver fuente de imagen: manual (campo imagen) o galeria_item
  const fuente: 'manual' | 'galeria_item' = (d as any).fuente === 'galeria_item' ? 'galeria_item' : 'manual';
  let media: any = null;
  let origenImagen: 'manual' | 'galeria_item' = 'manual';

  if (fuente === 'galeria_item') {
    const galeriaItem = unwrapRelation<StrapiGaleriaItem>((d as any).galeria_item ?? (d as any).galeriaItem);
    if (galeriaItem) {
      const galMedia: any = (galeriaItem as any).imagen ?? (galeriaItem as any).imagenCard ?? null;
      const galSrc = getStrapiMediaUrl(galMedia);
      if (galSrc) {
        media = galMedia;
        origenImagen = 'galeria_item';
      }
    }
    // Fallback a imagen directa si galeria_item no tiene imagen
    if (!media) {
      media = (d as any).imagen;
      origenImagen = 'manual';
    }
  } else {
    media = (d as any).imagen;
    origenImagen = 'manual';
  }

  const src = getStrapiMediaUrl(media);
  if (!src) return null;

  // Construir srcSet: si media tiene formats, usarlos; sino generar con mismo src
  let srcSet = `${src} 1920w`;
  const mediaEntity = unwrapStrapiEntity<any>(media);
  if (mediaEntity?.formats && typeof mediaEntity.formats === 'object') {
    const formats = mediaEntity.formats as Record<string, any>;
    const candidates: string[] = [];
    for (const [key, fmt] of Object.entries(formats)) {
      if (fmt?.url) {
        const u = getStrapiMediaUrl(fmt);
        if (u) candidates.push(`${u} ${fmt.width ?? 0}w`);
      }
    }
    if (candidates.length > 0) {
      // Añadir original al final
      candidates.push(`${src} ${mediaEntity.width ?? 1920}w`);
      srcSet = candidates.join(', ');
    }
  }

  const sizes = '(max-width: 640px) 640px, (max-width: 1024px) 1024px, (max-width: 1600px) 1600px, 1920px';

  const id = (d as any).documentId ?? String((d as any).id ?? src);

  // botonUrl tiene prioridad, fallback a enlace legacy
  const href: string = (d as any).botonUrl ?? (d as any).enlace ?? '/galeria';
  const botonTexto: string = (d as any).botonTexto ?? 'IR';
  const abrirEnNuevaPestana: boolean = !!(d as any).abrirEnNuevaPestana;
  const tituloOverlay: string | null = (d as any).tituloOverlay ?? null;
  const descripcionOverlay: string | null = (d as any).descripcionOverlay ?? null;

  return {
    id: String(id),
    src,
    srcSet,
    sizes,
    alt: (d as any).alt ?? (d as any).titulo ?? tituloOverlay ?? '',
    href,
    botonTexto: botonTexto || 'IR',
    abrirEnNuevaPestana,
    tituloOverlay,
    descripcionOverlay,
    titulo: (d as any).titulo ?? null,
    fuente,
    origenImagen,
  };
}

export function mapStrapiSlideToLandscapeSlide(raw: any): LandscapeSlide | null {
  const carrusel = mapStrapiSlideToCarruselSlide(raw);
  if (!carrusel) return null;
  // Extraer dims
  const rawMedia: any = unwrapStrapiEntity<any>(raw)?.imagen ?? (raw as any).imagen;
  const mediaEntity = unwrapStrapiEntity<any>(rawMedia);
  const width = mediaEntity?.width ?? 1920;
  const height = mediaEntity?.height ?? 1080;
  return {
    id: carrusel.id,
    image: {
      src: carrusel.src,
      srcSet: carrusel.srcSet,
      sizes: carrusel.sizes,
      width,
      height,
    },
    alt: carrusel.alt,
    href: carrusel.href,
  };
}

export function mapStrapiSlidesToCarrusel(list: any[]): CarruselSlide[] {
  if (!Array.isArray(list)) return [];
  return list
    .map(mapStrapiSlideToCarruselSlide)
    .filter((x): x is CarruselSlide => x !== null);
}

export function mapStrapiSlidesToLandscape(list: any[]): LandscapeSlide[] {
  if (!Array.isArray(list)) return [];
  return list
    .map(mapStrapiSlideToLandscapeSlide)
    .filter((x): x is LandscapeSlide => x !== null);
}

// ---------------------------------------------------------------------------
// Export helpers for testing
// ---------------------------------------------------------------------------

export const __testing = {
  stripHtml,
  formatFechaStrapi,
  slugify,
};
