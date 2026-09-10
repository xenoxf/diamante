import type { Especialidad } from '../types/especialidad.types';

export const especialidades: Especialidad[] = [
  {
    slug: 'electricidad',
    nombre: 'Técnico en Electricidad',
    images: ['/tecnica/electricidad/electricidad_1.jpeg'],
    contenido:
      '<p>Formación técnica orientada a las instalaciones eléctricas residenciales y a la práctica segura en taller. El estudiante desarrolla competencias básicas para el trabajo técnico y la continuidad en la educación superior.</p><h3>Puntos destacados</h3><ul><li>Instalaciones eléctricas residenciales</li><li>Seguridad eléctrica y normatividad básica</li><li>Lectura e interpretación de planos eléctricos</li><li>Práctica guiada en taller institucional</li></ul>',
    documentos: [],
  },
  {
    slug: 'sistemas',
    nombre: 'Técnico en Sistemas Teleinformaticos',
    images: ['/tecnica/sistemas/sistemas_1.jpeg'],
    contenido:
      '<p>Formación técnica en el uso, mantenimiento y aprovechamiento de las tecnologías de la información. El estudiante fortalece sus competencias digitales para el ámbito académico y laboral.</p><h3>Puntos destacados</h3><ul><li>Ofimática y herramientas digitales</li><li>Mantenimiento preventivo de equipos de cómputo</li><li>Fundamentos de redes básicas</li><li>Introducción al desarrollo de software</li></ul>',
    documentos: [],
  },
];
