export interface Especialidad {
  slug: string;
  nombre: string;
  descripcion: string;
  puntos: string[];
  images: string[];
  duracion?: string | null;
  planEstudioUrl?: string | null;
  orden?: number;
}
