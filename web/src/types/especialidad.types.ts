export interface Especialidad {
  slug: string;
  nombre: string;
  contenido: string;
  images: string[];
  documentos: { id: string; name: string; url: string; mime: string }[];
  orden?: number;
}
