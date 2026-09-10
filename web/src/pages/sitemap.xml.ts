/**
 * Sitemap dinámico ISR - equivalente a Yoast SEO en WordPress.
 *
 * - Genera XML al vuelo (no build-time), incluye colecciones Strapi (noticias, sedes, especialidades)
 * - Cacheado 5min en CDN + 1h stale-while-revalidate (Vercel ISR)
 * - Fallback a datos locales si Strapi cae (nunca 500)
 * - Hace ping implícito: Vercel purga CDN en revalidación
 *
 * Config en astro.config.mjs: sitemap() sigue generando sitemap-index.xml estático,
 * pero este /sitemap.xml es el canónico (robots.txt apunta aquí).
 */
export const prerender = false;

import { noticiasService } from '../services/noticias.service';
import { sedesService } from '../services/sedes.service';
import { especialidadesService } from '../services/especialidades.service';
import { setISRHeaders } from '../lib/isr';

// Rutas estáticas evergreen (SSG) - no dependen de Strapi
const STATIC_ROUTES: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/mision', changefreq: 'monthly', priority: '0.8' },
  { path: '/vision', changefreq: 'monthly', priority: '0.8' },
  { path: '/valores-institucionales', changefreq: 'monthly', priority: '0.7' },
  { path: '/organigrama', changefreq: 'monthly', priority: '0.6' },
  { path: '/pei', changefreq: 'monthly', priority: '0.7' },
  { path: '/a-que-vamos-al-colegio', changefreq: 'monthly', priority: '0.6' },
  { path: '/proyecto-ambiental', changefreq: 'monthly', priority: '0.6' },
  { path: '/sedes', changefreq: 'weekly', priority: '0.8' },
  { path: '/especialidades', changefreq: 'weekly', priority: '0.8' },
  { path: '/galeria', changefreq: 'daily', priority: '0.7' },
  { path: '/noticias', changefreq: 'daily', priority: '0.9' },
  { path: '/contacto', changefreq: 'monthly', priority: '0.7' },
  { path: '/canales-de-atencion', changefreq: 'monthly', priority: '0.6' },
  { path: '/directorio', changefreq: 'monthly', priority: '0.6' },
  { path: '/contratacion', changefreq: 'weekly', priority: '0.6' },
  { path: '/manual-convivencia', changefreq: 'monthly', priority: '0.6' },
  { path: '/inscripciones-abiertas', changefreq: 'weekly', priority: '0.7' },
  { path: '/peticiones-quejas-y-reclamos', changefreq: 'monthly', priority: '0.5' },
  { path: '/denuncias-hechos-de-corrupcion', changefreq: 'monthly', priority: '0.5' },
  { path: '/resolucion-proceso-de-matricula', changefreq: 'monthly', priority: '0.5' },
  { path: '/lista-utiles-escolares', changefreq: 'monthly', priority: '0.5' },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET({ request }: { request: Request }) {
  // ISR 5min CDN, 1h stale
  const response = new Response('', { headers: {} });
  setISRHeaders(response as any, { sMaxAge: 300, maxAge: 60, staleWhileRevalidate: 3600 });

  const siteUrl = (import.meta as any).env?.SITE_URL || process.env.SITE_URL || 'https://diamante-nu.vercel.app';
  const base = siteUrl.replace(/\/$/, '');
  const now = new Date().toISOString();

  // Recolectar dinámicas con fallback seguro (nunca throw)
  let noticiaSlugs: string[] = [];
  let sedeSlugs: string[] = [];
  let especialidadSlugs: string[] = [];

  try {
    const noticias = await noticiasService.getNoticias();
    noticiaSlugs = noticias.map((n) => n.slug).filter(Boolean);
  } catch {
    const { noticias: fb } = await import('../data/noticias');
    noticiaSlugs = fb.map((n) => n.slug);
  }

  try {
    const sedes = await sedesService.getSedes();
    sedeSlugs = sedes.map((s) => s.slug).filter(Boolean);
  } catch {
    const { sedes: fb } = await import('../data/sedes');
    sedeSlugs = fb.map((s) => s.slug);
  }

  try {
    const esps = await especialidadesService.getEspecialidades();
    especialidadSlugs = esps.map((e) => e.slug).filter(Boolean);
  } catch {
    const { especialidades: fb } = await import('../data/especialidades');
    especialidadSlugs = fb.map((e) => e.slug);
  }

  const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];

  for (const r of STATIC_ROUTES) {
    urls.push({
      loc: `${base}${r.path}`,
      lastmod: now,
      changefreq: r.changefreq,
      priority: r.priority,
    });
  }

  for (const slug of noticiaSlugs) {
    urls.push({
      loc: `${base}/noticias/${escapeXml(slug)}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.8',
    });
  }

  for (const slug of sedeSlugs) {
    urls.push({
      loc: `${base}/sedes/${escapeXml(slug)}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.7',
    });
  }

  for (const slug of especialidadSlugs) {
    urls.push({
      loc: `${base}/especialidades/${escapeXml(slug)}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.7',
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`;

  // Copiar headers ISR al response final
  const headers: Record<string, string> = {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': response.headers.get('Cache-Control') || 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
    'CDN-Cache-Control': response.headers.get('CDN-Cache-Control') || 'public, s-maxage=300, stale-while-revalidate=3600',
  };

  return new Response(xml, { headers });
}
