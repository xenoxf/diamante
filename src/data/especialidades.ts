import type { Especialidad } from './types';

export const especialidades: Especialidad[] = [
  {
    slug: 'electricidad',
    nombre: 'Técnico en Electricidad',
    images: ['/tecnica/electricidad/electricidad_1.jpeg'],
    descripcion:
      'Formación técnica orientada a las instalaciones eléctricas residenciales y a la práctica segura en taller. El estudiante desarrolla competencias básicas para el trabajo técnico y la continuidad en la educación superior.',
    puntos: [
      'Instalaciones eléctricas residenciales',
      'Seguridad eléctrica y normatividad básica',
      'Lectura e interpretación de planos eléctricos',
      'Práctica guiada en taller institucional',
    ],
  },
  {
    slug: 'sistemas',
    nombre: 'Técnico en Sistemas',
    images: ['/tecnica/sistemas/sistemas_1.jpeg'],
    descripcion:
      'Formación técnica en el uso, mantenimiento y aprovechamiento de las tecnologías de la información. El estudiante fortalece sus competencias digitales para el ámbito académico y laboral.',
    puntos: [
      'Ofimática y herramientas digitales',
      'Mantenimiento preventivo de equipos de cómputo',
      'Fundamentos de redes básicas',
      'Introducción al desarrollo de software',
    ],
  },
];
