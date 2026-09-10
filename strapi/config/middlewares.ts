import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:', 'http://localhost:*', '*.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:', 'http://localhost:*', '*.cloudinary.com'],
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      headers: '*',
      origin: [
        'http://localhost:4321',
        'http://localhost:3000',
        'http://localhost:1337',
        'https://diamante-nu.vercel.app',
        'https://*.vercel.app',
        process.env.STRAPI_CORS_ORIGIN || 'http://localhost:4321',
        process.env.SITE_URL || '',
        process.env.PUBLIC_SITE_URL || '',
      ].filter(Boolean),
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
