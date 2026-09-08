import type { CanalAtencion } from '../types/ciudadania.types';

export const canales: CanalAtencion[] = [
  {
    id: 'presencial',
    nombre: 'Atención presencial',
    detalle:
      'Secretarías de cada sede en el horario establecido. Sede principal: Carrera 33 N° 41-00, barrio El Diamante, Cali.',
  },
  {
    id: 'telefonico',
    nombre: 'Atención telefónica',
    detalle:
      'Sede principal 602 4260678 · Sede Juan Pablo II 602 4376986 · Sede Señor de los Milagros 602 3995982.',
  },
  {
    id: 'correo',
    nombre: 'Correo electrónico',
    detalle: 'Escríbanos a ie.eldiamante@cali.edu.co para consultas académicas y administrativas.',
  },
  {
    id: 'web',
    nombre: 'Sede electrónica',
    detalle:
      'Formularios de contacto, PQR y denuncias disponibles en la sección Servicios de este sitio.',
  },
];
