/// <reference types="astro/client" />

declare module '*.css';

interface ImportMetaEnv {
  readonly PUBLIC_STRAPI_URL?: string;
  readonly STRAPI_URL?: string;
  readonly STRAPI_API_TOKEN?: string;
  readonly PUBLIC_STRAPI_API_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
