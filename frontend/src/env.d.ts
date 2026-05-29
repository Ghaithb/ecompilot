/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLIC_KEY: string
  // plus d'env vars...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}