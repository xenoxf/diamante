export interface CarruselSlide {
  id: string;
  src: string;
  srcSet: string;
  sizes: string;
  alt: string;
  href: string;
}

export interface CarruselConfig {
  autoplayMs: number;
  transitionMs: number;
}
