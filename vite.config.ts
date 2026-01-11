import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', { target: '19' }]
        ]
      }
    }),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        name: 'Reisenotiz',
        short_name: 'Reisenotiz',
        description: 'Reisenotiz PWA',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            "src": "logo/favicon.svg",
            "sizes": "any",
            "type": "image/svg+xml",
            "purpose": "any"
          },
          {
            "src": "logo/favicon-16x16.png",
            "sizes": "16x16",
            "type": "image/png"
          },
          {
            "src": "logo/favicon-32x32.png",
            "sizes": "32x32",
            "type": "image/png"
          },
          {
            "src": "logo/favicon-48x48.png",
            "sizes": "48x48",
            "type": "image/png"
          },
          {
            "src": "logo/android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "logo/android-chrome-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "logo/apple-touch-icon.png",
            "sizes": "180x180",
            "type": "image/png"
          },
          {
            "src": "logo/apple-touch-icon-152x152.png",
            "sizes": "152x152",
            "type": "image/png"
          },
          {
            "src": "logo/apple-touch-icon-167x167.png",
            "sizes": "167x167",
            "type": "image/png"
          },
          {
            "src": "logo/apple-touch-icon-180x180.png",
            "sizes": "180x180",
            "type": "image/png"
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
})
