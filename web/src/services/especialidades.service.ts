import type { Especialidad } from '../types/especialidad.types';
import { especialidades } from '../data/especialidades';

export const especialidadesService = {
  getEspecialidades(): Especialidad[] {
    return especialidades;
  },

  getEspecialidadBySlug(slug: string): Especialidad | undefined {
    return especialidades.find((e) => e.slug === slug);
  },
};
