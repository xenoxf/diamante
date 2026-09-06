export interface Sede {
  slug: string;
  nombre: string;
  barrio: string;
  direccion: string;
  telefono: string;
  email: string;
  mapQuery: string;
  imgPath: string;
  bannerUrl?: string;
  horarioAtencion?: string | null;
  imagenCardUrl?: string | null;
}
