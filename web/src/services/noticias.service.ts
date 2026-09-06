import type { Noticia } from '../types/noticia.types';
import { noticias } from '../data/noticias';

export const noticiasService = {
  getNoticias(): Noticia[] {
    return noticias;
  },

  getNoticiaBySlug(slug: string): Noticia | undefined {
    return noticias.find((n) => n.slug === slug);
  },

  getNoticiasByCategoria(categoria: string): Noticia[] {
    return noticias.filter((n) => n.categoria === categoria);
  },
};
