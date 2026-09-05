export interface Sede {
  slug: string;
  nombre: string;
  barrio: string;
  direccion: string;
  telefono: string;
  email: string;
  mapQuery: string;
  imgPath: string;
}

export interface Noticia {
  slug: string;
  titulo: string;
  fecha: string;
  categoria: string;
  resumen: string;
}

export interface Especialidad {
  slug: string;
  nombre: string;
  descripcion: string;
  puntos: string[];
  images: string[];
}

export interface IdentidadCard {
  id: string;
  titulo: 'Misión' | 'Visión' | 'Valores Institucionales' | 'Organigrama';
  texto: string;
  imgPath: string;
  href: string;
}

export interface GaleriaItem {
  id: string;
  titulo: string;
  categoria: string;
}
