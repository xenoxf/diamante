/**
 * Helper central para integración con Strapi 5.
 * - Soporta URL y token desde env (PUBLIC_STRAPI_URL / STRAPI_URL / STRAPI_API_TOKEN)
 * - buildQuery con populate / filters / sort / pagination anidados
 * - fetchStrapi genérico + strapiFind / strapiFindOne tipados
 * - getStrapiMediaUrl resolución de URLs relativas a absolutas
 * - Compatibilidad Strapi 4 (attributes) y Strapi 5 (flat)
 */

function readEnv(name: string): string | undefined {
  // 1) Runtime Node (Vercel lambda) - process.env
  try {
    // @ts-ignore
    const v = typeof process !== 'undefined' ? (process.env as any)?.[name] : undefined;
    if (v) return v;
  } catch {}
  // 2) Build time Vite - import.meta.env
  try {
    // @ts-ignore
    const v = (import.meta as any)?.env?.[name];
    if (v) return v;
  } catch {}
  return undefined;
}

export const STRAPI_URL =
  readEnv('PUBLIC_STRAPI_URL') ||
  readEnv('STRAPI_URL') ||
  'http://localhost:1337';

export const STRAPI_TOKEN =
  readEnv('STRAPI_API_TOKEN') ||
  readEnv('PUBLIC_STRAPI_API_TOKEN') ||
  undefined;

/**
 * Construye query string para Strapi a partir de objeto params.
 * Soporta populate complejo, filters, sort, pagination, fields, status.
 *
 * Ejemplos:
 *  buildQuery({ populate: '*' })
 *  buildQuery({ populate: { categoria: { fields: ['nombre'] } } })
 *  buildQuery({ filters: { slug: { $eq: 'x' } } })
 *  buildQuery({ sort: ['orden:asc'], pagination: { page: 1, pageSize: 10 } })
 */
export function buildQuery(params?: Record<string, any>): string {
  if (!params || typeof params !== 'object') return '';

  const search = new URLSearchParams();

  function append(key: string, value: any) {
    if (value === null || value === undefined) return;

    // Primitivos
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      search.append(key, String(value));
      return;
    }

    // Arrays -> indices numéricos: key[0], key[1] ...
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        append(`${key}[${i}]`, v);
      });
      return;
    }

    // Objetos -> recursión: key[subkey]
    if (typeof value === 'object') {
      Object.entries(value).forEach(([sub, v]) => {
        append(`${key}[${sub}]`, v);
      });
    }
  }

  Object.entries(params).forEach(([k, v]) => append(k, v));

  return search.toString();
}

// ---------------------------------------------------------------------------
// Media helpers
// ---------------------------------------------------------------------------

export interface StrapiMediaLike {
  url?: string;
  attributes?: { url?: string };
  data?: any;
}

/**
 * Resuelve URL de media de Strapi a URL absoluta.
 * Soporta:
 *  - string ("/uploads/xxx.jpg" o "https://...")
 *  - Media entity flat (Strapi 5): { url: "/uploads/..." }
 *  - Media entity nested (Strapi 4): { data: { attributes: { url } } }
 *  - Wrapper { data: { url } } / { attributes: { url } }
 *  - Array de medias (toma el primero)
 */
export function getStrapiMediaUrl(media: any): string | null {
  if (!media) return null;

  if (typeof media === 'string') {
    if (media.startsWith('http://') || media.startsWith('https://')) return media;
    if (media.startsWith('//')) return `https:${media}`;
    // relativa
    return `${STRAPI_URL}${media.startsWith('/') ? '' : '/'}${media}`;
  }

  // Array -> primer elemento
  if (Array.isArray(media)) {
    if (media.length === 0) return null;
    return getStrapiMediaUrl(media[0]);
  }

  // Si es wrapper de colección: { data: [...] } o { data: { ... } }
  if (media?.data) {
    return getStrapiMediaUrl(media.data);
  }

  // Entity flat con url directa (Strapi 5)
  if (typeof media?.url === 'string') {
    const url: string = media.url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    return `${STRAPI_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  // Legacy nested: attributes.url (Strapi 4)
  if (typeof media?.attributes?.url === 'string') {
    const url: string = media.attributes.url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${STRAPI_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  // Algunos casos: media ya es { attributes: { ... } } sin data wrapper
  // Intentar buscar url en profundidad si es objeto con una sola key
  return null;
}

/**
 * Resuelve múltiples medias a array de URLs absolutas.
 */
export function getStrapiMediaUrls(medias: any): string[] {
  if (!medias) return [];
  if (Array.isArray(medias)) {
    return medias
      .map((m) => getStrapiMediaUrl(m))
      .filter((u): u is string => u !== null);
  }
  // Wrapper { data: [...] } o single
  if (medias?.data && Array.isArray(medias.data)) {
    return medias.data
      .map((m: any) => getStrapiMediaUrl(m))
      .filter((u: any) => u !== null);
  }
  const single = getStrapiMediaUrl(medias);
  return single ? [single] : [];
}

/**
 * Extrae dimensiones de media si están disponibles (para gallery).
 */
export function getStrapiMediaDimensions(media: any): { width: number; height: number } | null {
  if (!media) return null;
  if (Array.isArray(media)) media = media[0];
  if (media?.data) media = media.data;
  if (media?.attributes) media = media.attributes;
  if (typeof media?.width === 'number' && typeof media?.height === 'number') {
    return { width: media.width, height: media.height };
  }
  // formats puede tener tamaños
  return null;
}

// ---------------------------------------------------------------------------
// Fetch core
// ---------------------------------------------------------------------------

export interface FetchStrapiOptions {
  params?: Record<string, any>;
  token?: string;
  headers?: Record<string, string>;
  fetchOptions?: RequestInit;
}

/**
 * Fetch genérico a Strapi.
 * Construye URL `${STRAPI_URL}/api${path}?${query}`, añade headers y token.
 * Lanza Error si response.ok === false, incluyendo body para debug.
 */
export async function fetchStrapi<T = any>(
  path: string,
  options: FetchStrapiOptions = {},
): Promise<T> {
  const { params, token, headers: extraHeaders, fetchOptions } = options;

  const query = params ? buildQuery(params) : '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${STRAPI_URL}/api${normalizedPath}${query ? `?${query}` : ''}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...extraHeaders,
  };

  const authToken = token ?? STRAPI_TOKEN;
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  // Timeout corto para no colgar la lambda Vercel (hobby max 10s). 3s es suficiente para Strapi.
  const userSignal = (fetchOptions as any)?.signal as AbortSignal | undefined;
  const timeoutSignal: AbortSignal | undefined =
    userSignal ?? (typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(3000) : undefined);
  // Extraer signal de fetchOptions para no duplicar
  const { signal: _ignored, ...restFetchOptions } = (fetchOptions ?? {}) as any;

  const res = await fetch(url, {
    headers,
    ...restFetchOptions,
    ...(timeoutSignal ? { signal: timeoutSignal } : {}),
  });

  if (!res.ok) {
    let body = '';
    try {
      body = await res.text();
      // Intentar parsear JSON para mensaje más legible
      const json = JSON.parse(body);
      body = JSON.stringify(json).slice(0, 1000);
    } catch {
      body = body.slice(0, 1000);
    }
    throw new Error(
      `Strapi fetch failed: ${res.status} ${res.statusText} - ${body} (url: ${url})`,
    );
  }

  const json = await res.json();
  return json as T;
}

// ---------------------------------------------------------------------------
// Typed helpers para Collection vs Single
// ---------------------------------------------------------------------------

import type {
  StrapiCollectionResponse,
  StrapiSingleResponse,
} from './strapi-types';

/**
 * Helper tipado para colecciones (GET /api/xxx).
 * Retorna StrapiCollectionResponse<T> = { data: T[], meta: { pagination } }
 */
export async function strapiFind<T>(
  path: string,
  params?: Record<string, any>,
  token?: string,
): Promise<StrapiCollectionResponse<T>> {
  return fetchStrapi<StrapiCollectionResponse<T>>(path, { params, token });
}

/**
 * Helper tipado para single types o documentId (GET /api/xxx o /api/xxx/:id).
 * Retorna StrapiSingleResponse<T> = { data: T, meta: {} }
 * Para colecciones filtradas por slug, usar strapiFind + filters.
 */
export async function strapiFindOne<T>(
  path: string,
  params?: Record<string, any>,
  token?: string,
): Promise<StrapiSingleResponse<T>> {
  return fetchStrapi<StrapiSingleResponse<T>>(path, { params, token });
}

// ---------------------------------------------------------------------------
// Compat helpers (Strapi 4 attributes vs Strapi 5 flat)
// ---------------------------------------------------------------------------

/**
 * Normaliza entidad Strapi: si tiene wrapper { data, attributes }, aplana.
 * Soporta:
 *  - Strapi 4: { id, attributes: { slug, ... } } -> { id, slug, ... }
 *  - Strapi 5: { documentId, slug, ... } -> { documentId, slug, ... }
 *  - Wrapper { data: {...} } -> unwrap recursivo
 */
export function unwrapStrapiEntity<T = any>(entity: any): T & { documentId?: string; id?: number | string } {
  if (!entity) return entity;
  // Wrapper { data: ... }
  if (entity.data !== undefined && !entity.attributes && entity.id === undefined && entity.documentId === undefined) {
    return unwrapStrapiEntity(entity.data);
  }
  // Strapi 4 attributes wrapper
  if (entity.attributes && typeof entity.attributes === 'object') {
    const { attributes, ...rest } = entity;
    return { ...rest, ...attributes } as any;
  }
  return entity as any;
}

/**
 * Normaliza array de entidades (collection).
 */
export function unwrapStrapiEntities<T = any>(data: any): Array<T & { documentId?: string; id?: number | string }> {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map((e) => unwrapStrapiEntity<T>(e));
  }
  // Single object wrapped as array-like? Devolver array de 1
  return [unwrapStrapiEntity<T>(data)];
}

/**
 * Helper para extraer data + meta de respuesta Strapi, manejando ambos formatos.
 */
export function extractStrapiData<T>(response: any): { data: T | T[] | null; meta: any } {
  if (!response) return { data: null, meta: {} };
  // Strapi 5: { data: [...], meta: {...} } o { data: {...}, meta: {...} }
  if (response.data !== undefined) {
    return { data: response.data, meta: response.meta ?? {} };
  }
  // Si response ya es el data directo (fallback)
  return { data: response, meta: {} };
}
