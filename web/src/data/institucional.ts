import type { DocumentoInstitucional } from '../types/institucional.types';

const UPLOADS = 'https://www.ie-eldiamantecali.edu.co/wp-content/uploads';
const SITE = 'https://www.ie-eldiamantecali.edu.co';

export const documentos: DocumentoInstitucional[] = [
  {
    id: 'manual-convivencia',
    titulo: 'Manual de Convivencia IE El Diamante',
    descripcion: 'Derechos, deberes, estímulos y procedimientos de la comunidad educativa.',
    url: `${UPLOADS}/2025/01/MANUAL-CONVIVENCIA-IE-EL-DIAMANTE-1.pdf`,
    formato: 'PDF',
  },
  {
    id: 'a-que-vamos-al-colegio',
    titulo: '¿A qué vamos al colegio?',
    descripcion: 'Documento de la campaña de regreso y permanencia escolar.',
    url: `${UPLOADS}/2025/01/A-que-vamos-al-colegio.pdf`,
    formato: 'PDF',
  },
  {
    id: 'proyecto-ambiental',
    titulo: 'Proyecto Ambiental Escolar (PRAE)',
    descripcion: 'Proyecto ambiental de la Institución Educativa El Diamante.',
    url: `${UPLOADS}/2025/01/Proyecto-Ambiental.pdf`,
    formato: 'PDF',
  },
  {
    id: 'ficha-inscripcion',
    titulo: 'Ficha de inscripción actualizada',
    descripcion: 'Formulario de inscripción para aspirantes a cupo escolar.',
    url: `${UPLOADS}/2024/10/FICHA-DE-INSCRIPCION-ACTUALIZADA-eldiamante.pdf`,
    formato: 'PDF',
  },
  {
    id: 'organigrama',
    titulo: 'Organigrama institucional',
    descripcion: 'Estructura organizacional de la Institución Educativa El Diamante.',
    url: `${UPLOADS}/2024/09/Organigrama-el-diamante-2-1024x683.png`,
    formato: 'Imagen',
  },
  {
    id: 'resolucion-matricula',
    titulo: 'Resolución del Proceso de Matrícula',
    descripcion: 'Acto administrativo que regula el proceso de matrícula.',
    url: `${SITE}/resolucion-proceso-de-matricula/`,
    formato: 'Enlace',
  },
  {
    id: 'pei',
    titulo: 'Proyecto Educativo Institucional',
    descripcion: 'Proyecto Educativo Institucional de la IE El Diamante — P.E.I. Definitivo.',
    url: `${UPLOADS}/2024/09/P.E.I.-DEFINITIVO-DIAMANTE.pdf`,
    formato: 'PDF',
  }
];
