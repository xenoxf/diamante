import type { CanalAtencion, EntradaDirectorio } from '../types/ciudadania.types';
import { canales } from '../data/ciudadania';
import { sedesService } from './sedes.service';

export const EMAIL_INSTITUCIONAL = 'ie.eldiamante@cali.edu.co';
export const TRANSPARENCIA_URL = 'https://transparencia.cali.gov.co/';
export const PQR_EXTERNO_URL = 'https://www.cali.gov.co/';

export const ciudadaniaService = {
  getCanales(): CanalAtencion[] {
    return canales;
  },

  getDirectorio(): EntradaDirectorio[] {
    return [
      {
        dependencia: 'Rectoría',
        sede: 'Sede El Diamante (Principal)',
        telefono: '602 4260678',
        email: EMAIL_INSTITUCIONAL,
      },
      ...sedesService
        .getSedes()
        .filter((s) => s.slug !== 'el-diamante')
        .map((s) => ({
          dependencia: `Coordinación ${s.nombre}`,
          sede: s.nombre,
          telefono: s.telefono,
          email: s.email,
        })),
    ];
  },
};
