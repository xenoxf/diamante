import type { GalleryImage, LandscapeSlide } from '../types/landscape.types';

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const TARGET_HREF = '/galeria';
const SIZES = '(max-width: 640px) 640px, (max-width: 1024px) 1024px, (max-width: 1600px) 1600px, 1920px';

const CAROUSEL_QUERY = 'mountain lake valley national park filetype:bitmap';
const GALLERY_QUERIES = [
  'forest waterfall nature filetype:bitmap',
  'tropical beach coast filetype:bitmap',
  'mountain lake valley national park filetype:bitmap',
];

/** IDs de Picsum verificados como paisajes/naturaleza. Solo fallback sin red. */
const FALLBACK_IDS = ['1015', '1016', '1018', '1019', '1036', '1039', '10', '28'];

interface CommonsInfo {
  thumburl?: string;
  url?: string;
  width?: number;
  height?: number;
}

interface CommonsPage {
  pageid: number;
  title: string;
  imageinfo?: CommonsInfo[];
}

function picsumSrc(id: string, w: number, h: number): string {
  return `https://picsum.photos/id/${id}/${w}/${h}`;
}

function picsumSrcSet(id: string): string {
  return [
    `${picsumSrc(id, 640, 360)} 640w`,
    `${picsumSrc(id, 1024, 576)} 1024w`,
    `${picsumSrc(id, 1600, 900)} 1600w`,
    `${picsumSrc(id, 1920, 1080)} 1920w`,
  ].join(', ');
}

function picsumFallback(limit: number): LandscapeSlide[] {
  return FALLBACK_IDS.slice(0, limit).map((id) => ({
    id: `paisaje-${id}`,
    image: {
      src: picsumSrc(id, 1920, 1080),
      srcSet: picsumSrcSet(id),
      sizes: SIZES,
      width: 1920,
      height: 1080,
    },
    alt: '',
    href: TARGET_HREF,
  }));
}

function picsumGalleryFallback(count: number): GalleryImage[] {
  const ratios: Array<[number, number]> = [
    [600, 800],
    [600, 450],
    [600, 600],
    [600, 750],
    [600, 500],
    [600, 850],
  ];
  return Array.from({ length: count }, (_, i) => {
    const id = FALLBACK_IDS[i % FALLBACK_IDS.length]!;
    const [w, h] = ratios[i % ratios.length]!;
    return {
      id: `galeria-${id}-${i}`,
      src: picsumSrc(id, w, h),
      width: w,
      height: h,
      alt: '',
      href: TARGET_HREF,
    };
  });
}

async function searchCommons(
  query: string,
  thumbWidth: number,
  limit: number,
  signal?: AbortSignal,
): Promise<GalleryImage[]> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '6',
    gsrlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|size',
    iiurlwidth: String(thumbWidth),
    origin: '*',
  });
  const res = await fetch(`${COMMONS_API}?${params.toString()}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Commons respondió ${res.status}`);
  const data = await res.json();
  const pages = (data?.query?.pages ?? []) as CommonsPage[];
  const out: GalleryImage[] = [];
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    const src = info?.thumburl ?? info?.url;
    if (!src || !info?.width || !info?.height) continue;
    out.push({
      id: `commons-${page.pageid}`,
      src,
      width: info.width,
      height: info.height,
      alt: '',
      href: TARGET_HREF,
    });
  }
  return out;
}

function toSlide(img: GalleryImage): LandscapeSlide {
  return {
    id: img.id,
    image: {
      src: img.src,
      srcSet: `${img.src} ${Math.min(img.width, 1920)}w`,
      sizes: SIZES,
      width: img.width,
      height: img.height,
    },
    alt: '',
    href: img.href,
  };
}

let carouselCache: LandscapeSlide[] | null = null;
let galleryCache: GalleryImage[] | null = null;

async function getLandscapeSlides(
  limit = 8,
  signal?: AbortSignal,
): Promise<LandscapeSlide[]> {
  if (carouselCache) return carouselCache.slice(0, limit);
  try {
    const found = await searchCommons(CAROUSEL_QUERY, 1920, 12, signal);
    const landscapes = found.filter((img) => img.width >= img.height).slice(0, limit);
    if (landscapes.length >= 2) {
      carouselCache = landscapes.map(toSlide);
      return carouselCache.slice(0, limit);
    }
    throw new Error('Sin suficientes paisajes');
  } catch {
    if (signal?.aborted) return [];
    return picsumFallback(limit);
  }
}

async function getGalleryImages(
  count = 16,
  signal?: AbortSignal,
): Promise<GalleryImage[]> {
  if (galleryCache) return galleryCache.slice(0, count);
  try {
    const perQuery = Math.ceil(count / GALLERY_QUERIES.length) + 2;
    const batches = await Promise.all(
      GALLERY_QUERIES.map((q) => searchCommons(q, 800, perQuery, signal)),
    );
    const merged: GalleryImage[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < perQuery; i++) {
      for (const batch of batches) {
        const img = batch[i];
        if (img && !seen.has(img.id)) {
          seen.add(img.id);
          merged.push(img);
        }
      }
    }
    if (merged.length >= 6) {
      galleryCache = merged;
      return merged.slice(0, count);
    }
    throw new Error('Sin suficientes imágenes');
  } catch {
    if (signal?.aborted) return [];
    return picsumGalleryFallback(count);
  }
}

export const landscapeService = {
  getLandscapeSlides,
  getGalleryImages,
};

