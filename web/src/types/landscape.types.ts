export interface PicsumPhoto {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

export interface LandscapeImage {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
}

export interface LandscapeSlide {
  id: string;
  image: LandscapeImage;
  alt: string;
  href: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  href: string;
  titulo?: string;
  categoria?: string;
}
