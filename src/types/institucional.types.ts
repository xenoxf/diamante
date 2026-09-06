export interface DocumentoInstitucional {
  id: string;
  titulo: string;
  descripcion: string;
  url: string;
  formato: 'PDF' | 'Imagen' | 'Enlace';
}
