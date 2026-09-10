export interface CarruselSlide {
  id: string;
  src: string;
  srcSet: string;
  sizes: string;
  alt: string;
  href: string;
  botonTexto: string;
  abrirEnNuevaPestana: boolean;
  tituloOverlay?: string | null;
  descripcionOverlay?: string | null;
  titulo?: string | null;
  fuente?: 'manual' | 'galeria_item' | null;
  // debug / trazabilidad origen imagen
  origenImagen?: 'manual' | 'galeria_item';
}

export interface CarruselConfig {
  autoplayMs: number;
  transitionMs: number;
}
