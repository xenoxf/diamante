// Alias correcto para mansory.tsx (typo histórico). Re-exporta el componente Masonry.
// Mantener compatibilidad: ambos `import ... from "./masonry"` y `from "./mansory"` funcionan.
export { default } from "./mansory";
export * from "./mansory";
