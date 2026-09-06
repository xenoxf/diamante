import type { IdentidadCard } from '../types/identidad.types';
import { identidadCards as identidadFallback } from '../data/identidad';
import { fetchStrapi } from '../lib/strapi';
import { mapStrapiPaginaIdentidadToCards } from '../lib/mappers';
import type { StrapiSingleResponse } from '../lib/strapi-types';

const identidadFallbackRaw = {
  mision:
    '<p>La <strong>Institución Educativa El Diamante</strong> se reconoce pluriétnica y multicultural. Forma estudiantes con calidad humana y competencias técnicas, a través de la participación de los actores educativos y con el apoyo de diferentes instituciones educativas a nivel local, regional, nacional y del entorno de la comuna 13.</p><p>Este trabajo articulado permite a los estudiantes la construcción de relaciones sociales dinámicas y prósperas para el desarrollo de competencias que faciliten el acceso al campo laboral o a la educación superior.</p>',
  vision:
    '<p>La <strong>Institución Educativa El Diamante</strong>, al 2030, será reconocida como una institución pluriétnica y multicultural, modelo de excelencia en la educación media técnica en la comuna 13 de Santiago de Cali y referente para el desarrollo social de la comunidad.</p>',
  valoresIntroduccion:
    'Se definen como valores institucionales aquellos que identificarán al educando formado en nuestras aulas y que fueron elegidos como parte de nuestra filosofía educativa, producto del entorno y del PEI. Los valores corporativos definidos para la formación de nuestros estudiantes son:',
  valoresImagen: null,
  valores: [
    {
      titulo: 'Pensamiento Crítico y Toma de Decisiones',
      descripcion:
        'Que comprenda, analice, discierna, argumente y proponga soluciones sobre situaciones de su entorno que le permita actuar de forma autónoma para resolver conflictos con responsabilidad social.',
      orden: 1,
    },
    {
      titulo: 'Identidad y Pertenencia',
      descripcion:
        'Se reconozca como parte de la comunidad Diamantina cumpliendo sus deberes institucionales y compromisos, reflejando en actuaciones dentro y fuera de la institución los valores institucionales, además portando sus distintivos con orgullo y respeto.',
      orden: 2,
    },
    {
      titulo: 'Trabajo en Equipo',
      descripcion:
        'Dinamiza la unidad grupal para fomentar la solidaridad, la responsabilidad, el compromiso, la tolerancia, el respeto mutuo, la discusión democrática, el compromiso hacia los consensos en pro del desarrollo institucional.',
      orden: 3,
    },
    {
      titulo: 'Creatividad',
      descripcion:
        'Actitud innovadora que le permite la capacidad de generar ideas constructivas para su vida cotidiana de manera práctica.',
      orden: 4,
    },
    {
      titulo: 'Inclusión Social',
      descripcion:
        'Interacción con sus pares, y en cualquier grupo social apoyándose en la convivencia pacífica.',
      orden: 5,
    },
  ],
  organigrama: null,
  organigramaDescripcion:
    'La institución cuenta con una estructura organizacional encabezada por la Rectoría, apoyada por las coordinaciones, el consejo directivo y los órganos de participación de la comunidad educativa.',
  misionImagen: null,
  visionImagen: null,
};

export const identidadService = {
  async getIdentidad(): Promise<any> {
    try {
      const res = await fetchStrapi<StrapiSingleResponse<any>>('/pagina-identidad', {
        params: {
          populate: {
            misionImagen: { fields: ['url', 'width', 'height'] },
            visionImagen: { fields: ['url', 'width', 'height'] },
            valoresImagen: { fields: ['url', 'width', 'height'] },
            organigrama: { fields: ['url', 'width', 'height'] },
            valores: { populate: '*' },
          },
          status: 'published',
        },
      });
      const data: any = (res as any).data ?? res;
      const unwrapped = data?.data ?? data;
      const entity = unwrapped && typeof unwrapped === 'object' && !Array.isArray(unwrapped) ? unwrapped : null;
      if (!entity || (!entity.mision && !entity.vision)) {
        return identidadFallbackRaw;
      }
      return entity;
    } catch (err) {
      console.warn('[identidadService.getIdentidad] fallback:', err);
      return identidadFallbackRaw;
    }
  },

  async getIdentidadCards(): Promise<IdentidadCard[]> {
    try {
      const res = await fetchStrapi<StrapiSingleResponse<any>>('/pagina-identidad', {
        params: {
          populate: {
            misionImagen: { fields: ['url', 'width', 'height'] },
            visionImagen: { fields: ['url', 'width', 'height'] },
            valoresImagen: { fields: ['url', 'width', 'height'] },
            organigrama: { fields: ['url', 'width', 'height'] },
            valores: { populate: '*' },
          },
          status: 'published',
        },
      });
      const data: any = (res as any).data ?? res;
      const unwrapped = data?.data ?? data;
      // Strapi single puede venir como objeto directo
      const entity = unwrapped && typeof unwrapped === 'object' && !Array.isArray(unwrapped) ? unwrapped : null;
      if (!entity || (!entity.mision && !entity.vision)) {
        return identidadFallback;
      }
      const cards = mapStrapiPaginaIdentidadToCards(entity);
      if (cards.length === 0) return identidadFallback;
      return cards;
    } catch (err) {
      console.warn('[identidadService.getIdentidadCards] fallback:', err);
      return identidadFallback;
    }
  },

  async getIdentidadCardById(id: string): Promise<IdentidadCard | undefined> {
    try {
      const cards = await this.getIdentidadCards();
      const found = cards.find((c) => c.id === id);
      if (found) return found;
      return identidadFallback.find((c) => c.id === id);
    } catch {
      return identidadFallback.find((c) => c.id === id);
    }
  },
};
