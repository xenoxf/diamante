import type { Invitacion } from '../types/contratacion.types';
import { invitaciones } from '../data/contratacion';

export const contratacionService = {
  getInvitaciones(): Invitacion[] {
    return invitaciones;
  },

  getInvitacionByNumero(numero: string): Invitacion | undefined {
    return invitaciones.find((i) => i.numero === numero);
  },
};
