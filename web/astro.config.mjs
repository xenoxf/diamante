// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import vercel from '@astrojs/vercel'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  output: 'server',
  adapter: vercel(),

  integrations: [
    react(),
    sitemap(),
  ],

  vite: {
    envPrefix: ['PUBLIC_', 'STRAPI_'],
  },

  site: process.env.SITE_URL || 'https://diamante-nu.vercel.app',
})
