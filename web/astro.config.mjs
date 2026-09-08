// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import node from '@astrojs/node'

export default defineConfig({
  // Decisión 8: ISR. `output: 'server'` + `prerender = true` por página =
  // SSG en build + render bajo demanda con cache para slugs nuevos de Strapi.
  // Ver src/lib/isr.ts (Cache-Control: s-maxage + stale-while-revalidate).
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  // PUBLIC_STRAPI_URL ya es expuesta automáticamente por Astro (prefijo PUBLIC_)
  // Se documenta aquí el uso: import.meta.env.PUBLIC_STRAPI_URL
  vite: {
    // Asegurar que variables con prefijo PUBLIC_ estén disponibles en client
    envPrefix: ['PUBLIC_', 'STRAPI_'],
  },
  // Para SEO canonical si se despliega con dominio real, configurar site:
  // site: process.env.PUBLIC_SITE_URL || 'https://www.ie-eldiamantecali.edu.co',
})