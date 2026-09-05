import type { IdentidadCard } from './types';

export const identidadCards: IdentidadCard[] = [
  {
    id: 'mision',
    titulo: 'Misión',
    imgPath: '/identidad/mision.png',
    texto:
      'La Institución Educativa El Diamante forma estudiantes íntegros, responsables y comprometidos con su comunidad, mediante una educación pública de calidad que promueve el conocimiento, la convivencia y el respeto por la diversidad.',
    href: '/mision',
  },
  {
    id: 'vision',
    titulo: 'Visión',
    imgPath: '/identidad/vision.png',
    texto:
      'Ser reconocida como una institución pública líder en formación académica y técnica, caracterizada por la excelencia pedagógica, la sana convivencia y el compromiso con el desarrollo social del Distrito de Cali.',
    href: '/vision',
  },
  {
    id: 'valores',
    titulo: 'Valores Institucionales',
    imgPath: '/identidad/valores.png',
    texto:
      'La vida institucional se orienta por el respeto, la responsabilidad, la honestidad y la solidaridad. Estos valores guían la convivencia escolar y el trabajo diario de estudiantes, docentes y familias.',
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
