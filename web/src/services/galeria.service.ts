import type { GaleriaItem } from '../types/galeria.types';
import type { GalleryImage } from '../types/landscape.types';
import { galeria } from '../data/galeria';
import { landscapeService } from './landscape.service';

export const galeriaService = {
  getGaleria(): GaleriaItem[] {
    return galeria;
  },

  getGaleriaByCategoria(categoria: string): GaleriaItem[] {
    return galeria.filter((g) => g.categoria === categoria);
  },

  getGaleriaImages(count = 16, signal?: AbortSignal): Promise<GalleryImage[]> {
    return landscapeService.getGalleryImages(count, signal);
  },
};
