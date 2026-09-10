// Compat: pqrsform (minúsculas) re-exporta el formulario canónico PqrsfForm con upload
// Mantener para no romper imports legacy; usar PqrsfForm.tsx como fuente única
export { default } from './PqrsfForm';
export * from './PqrsfForm';