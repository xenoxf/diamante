export interface Noticia {
  slug: string;
  titulo: string;
  fecha: string;
  categoria: string;
  resumen: string;
  contenido?: string;
  portadaUrl?: string | null;
  galeriaUrls?: string[];
  destacada?: boolean;
  fechaRaw?: string | null;
  categoriaSlug?: string | null;
}
