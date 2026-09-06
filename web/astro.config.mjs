// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'

export default defineConfig({
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