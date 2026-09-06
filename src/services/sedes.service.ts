import type { Sede } from '../types/sede.types';
import { sedes } from '../data/sedes';

export const sedesService = {
  getSedes(): Sede[] {
    return sedes;
  },

  getSedeBySlug(slug: string): Sede | undefined {
    return sedes.find((s) => s.slug === slug);
  },
};
