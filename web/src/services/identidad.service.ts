import type { IdentidadCard } from '../types/identidad.types';
import { identidadCards } from '../data/identidad';

export const identidadService = {
  getIdentidadCards(): IdentidadCard[] {
    return identidadCards;
  },

  getIdentidadCardById(id: string): IdentidadCard | undefined {
    return identidadCards.find((c) => c.id === id);
  },
};
