// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import vercel from '@astrojs/vercel'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  // Static (Astro 5+): estático por defecto, solo rutas con `export const prerender = false` van a función ISR
  output: 'static',
  adapter: vercel({
    isr: {
      // Fallback default para páginas ISR; cada página puede sobreescribir con Astro.response headers
      expiration: 300,
    },
  }),

  integrations: [
    react(),
    sitemap(),
  ],

  // Deja que Astro importe imágenes con <img> nativo. No usamos sharp remoto en lambda para evitar crash nativo.
  // Si necesitas optimización, cambia a: image: { service: { entrypoint: 'astro/assets/services/sharp' } } y añade `sharp` a dependencies
  image: {
    service: { entrypoint: 'astro/assets/services/noop' },
  },

  vite: {
    envPrefix: ['PUBLIC_'],
  },

  site: process.env.SITE_URL || 'https://diamante-nu.vercel.app',
})
