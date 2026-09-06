import type { DocumentoInstitucional } from '../types/institucional.types';
import { documentos } from '../data/institucional';

export const institucionalService = {
  getDocumentos(): DocumentoInstitucional[] {
    return documentos;
  },

  getDocumentoById(id: string): DocumentoInstitucional | undefined {
    return documentos.find((d) => d.id === id);
  },
};
