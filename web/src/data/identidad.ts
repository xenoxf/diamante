import type { IdentidadCard } from '../types/identidad.types';

export const identidadCards: IdentidadCard[] = [
  {
    id: 'mision',
    titulo: 'Misión',
    imgPath: '/identidad/mision.png',
    texto:
      'La INSTITUCIÓN EDUCATIVA EL DIAMANTE se reconoce pluriétnica y multicultural que forma estudiantes con calidad humana y competencias técnicas, a través de la participación de los actores educativos con el apoyo de diferentes instituciones educativas a nivel local, regional, nacional y del entorno de la comuna 13; lo que permite a los estudiantes la construcción de relaciones sociales dinámicas y prósperas para el desarrollo de competencias que faciliten el acceso al campo laboral o a la educación superior.',
    href: '/mision',
  },
  {
    id: 'vision',
    titulo: 'Visión',
    imgPath: '/identidad/vision.png',
    texto:
      'La Institución Educativa El Diamante, al 2017, será reconocida como una institución pluriétnica y multicultural, modelo de excelencia en la educación media técnica en la comuna 13 de Santiago de Cali y referente para el desarrollo social de la comunidad.',
    href: '/vision',
  },
  {
    id: 'valores',
    titulo: 'Valores Institucionales',
    imgPath: '/identidad/valores.png',
    texto:
      'Pensamiento crítico, identidad y pertenencia, trabajo en equipo, creatividad e inclusión social: los valores que identifican al educando diamantino.',
    href: '/valores-institucionales',
  },
  {
    id: 'organigrama',
    imgPath: '/identidad/organigrama.png',
    titulo: 'Organigrama',
    texto:
      'La institución cuenta con una estructura organizacional encabezada por la Rectoría, apoyada por las coordinaciones, el consejo directivo y los órganos de participación de la comunidad educativa.',
    href: '/organigrama',
  },
];
