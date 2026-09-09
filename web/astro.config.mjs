// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import node from '@astrojs/node'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  // Decisión 8: ISR. `output: 'server'` + `prerender = true` por página =
  // SSG en build + render bajo demanda con cache para slugs nuevos de Strapi.
  // Ver src/lib/isr.ts (Cache-Control: s-maxage + stale-while-revalidate).
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react(), sitemap()],
  // PUBLIC_STRAPI_URL ya es expuesta automáticamente por Astro (prefijo PUBLIC_)
  // Se documenta aquí el uso: import.meta.env.PUBLIC_STRAPI_URL
  vite: {
    // Asegurar que variables con prefijo PUBLIC_ estén disponibles en client
    envPrefix: ['PUBLIC_', 'STRAPI_'],
  },
  site: process.env.SITE_URL || 'https://diamante-nu.vercel.app',
})