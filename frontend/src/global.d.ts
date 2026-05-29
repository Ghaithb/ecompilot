// Global type declarations
declare module 'minimatch' {
  export default function minimatch(target: string, pattern: string, options?: any): boolean;
}

// Pour Vite
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // ajouter d'autres variables d'environnement ici
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}