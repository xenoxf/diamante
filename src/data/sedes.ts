import type { Sede } from './types';

export const sedes: Sede[] = [
  {
    slug: 'el-diamante',
    nombre: 'Sede El Diamante (Principal)',
    barrio: 'El Diamante',
    direccion: 'Carrera 33 N° 41-00, Cali, Colombia',
    telefono: '602 4260678',
    email: 'ie.eldiamante@cali.edu.co',
    mapQuery: 'Carrera 33 #41-00, El Diamante, Cali, Colombia',
    imgPath: '/sedes/sede_principal.png'
  },
  {
    slug: 'juan-pablo-ii',
    nombre: 'Sede Juan Pablo II',
    barrio: 'El Vergel',
    direccion: 'Carrera 33 N° 42 C 09, Cali, Colombia',
    telefono: '602 4376986',
    email: 'ie.eldiamante@cali.edu.co',
    mapQuery: 'Carrera 33 #42C-09, El Vergel, Cali, Colombia',
    imgPath: '/sedes/sede_juan_pablo.png'
  },
  {
    slug: 'senor-de-los-milagros',
    nombre: 'Sede Señor de los Milagros',
    barrio: 'El Retiro',
    direccion: 'KR 36 #51-02, Cali, Colombia',
    telefono: '602 3995982',
    email: 'ie.eldiamante@cali.edu.co',
    mapQuery: 'Carrera 36 #51-02, El Retiro, Cali, Colombia',
    imgPath: '/sedes/sede_retiro.png'
  },
];
