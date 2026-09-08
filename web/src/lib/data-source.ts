/**
 * Utilidad para trazar el origen de los datos (Strapi vs fallback local).
 * Decisión 16 del usuario: si el dato no llegó de Strapi, el frontend debe
 * mostrar un pequeño texto que avise si es de Strapi o fallback.
 *
 * Patrón: los servicios adjuntan `_source` al payload con attachSource()
 * y los componentes Astro lo leen con readSource() para renderizar
 * <DataSourceBadge source={...} />.
 */

export type DataSource = 'strapi' | 'fallback';

export const DATA_SOURCE_ATTR = '_source';

/**
 * Adjunta la marca de origen a un array u objeto sin romper su forma.
 * El valor sigue siendo el mismo array/objeto (backward compatible),
 * solo añade una prop no enumerable `_source`.
 */
export function attachSource<T>(data: T, source: DataSource): T & { _source: DataSource } {
  if (data === null || data === undefined) return data as any;
  try {
    Object.defineProperty(data as any, DATA_SOURCE_ATTR, {
      value: source,
      enumerable: false,
      writable: true,
      configurable: true,
    });
  } catch {
    try {
      (data as any)[DATA_SOURCE_ATTR] = source;
    } catch {
      // ignore: objetos congelados
    }
  }
  return data as T & { _source: DataSource };
}

/** Lee la marca de origen. Si no hay marca, asume 'fallback' (seguro). */
export function readSource(data: any, fallback: DataSource = 'fallback'): DataSource {
  if (!data) return fallback;
  const s = (data as any)?.[DATA_SOURCE_ATTR];
  if (s === 'strapi' || s === 'fallback') return s;
  return fallback;
}

export function isFallback(data: any): boolean {
  return readSource(data) === 'fallback';
}

/** Texto corto para el badge. */
export function sourceLabel(source: DataSource): string {
  return source === 'strapi' ? 'Strapi en vivo' : 'Fallback local · Strapi no disponible';
}
