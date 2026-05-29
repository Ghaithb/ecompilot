import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
// Try to load local HTTPS certs for Stripe in dev
const certPath = path.resolve(__dirname, 'localhost.pem')
const keyPath = path.resolve(__dirname, 'localhost-key.pem')
const httpsOption = (fs.existsSync(certPath) && fs.existsSync(keyPath))
  ? { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) }
  : undefined

export default defineConfig({

  plugins: [
    // Tailwind CSS v4 plugin processes `@import "tailwindcss"` and friends
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@core": path.resolve(__dirname, "./src/core"),
      "@modules": path.resolve(__dirname, "./src/modules"),
      "@integrations": path.resolve(__dirname, "./src/integrations"),
      "@ui": path.resolve(__dirname, "./src/ui"),
      "@lib": path.resolve(__dirname, "./src/lib"),
    },
  },
  server: {
    port: 5173,
    host: 'localhost',
    https: httpsOption,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // Proxy uploads served by backend so <img src="/uploads/..."> works from the frontend origin
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: true
  }
})