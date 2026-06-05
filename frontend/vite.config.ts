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

import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({

  plugins: [
    // Tailwind CSS v4 plugin processes `@import "tailwindcss"` and friends
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'EcomPilot',
        short_name: 'EcomPilot',
        description: 'Gérez votre boutique partout',
        theme_color: '#7C3AED',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/dashboard',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', 
            type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        runtimeCaching: [
          {
            urlPattern: /\/api\/v1\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 5 }
          }
        ]
      }
    })
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
    strictPort: true,
    host: 'localhost',
    https: httpsOption,
    hmr: {
      protocol: httpsOption ? 'wss' : 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // Proxy uploads served by backend so <img src="/uploads/..."> works from the frontend origin
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: true
  }
})