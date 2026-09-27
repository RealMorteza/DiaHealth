import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(), // ❗ مهم
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['diahealth-icon.svg'],
      workbox: {
        importScripts: ['notification-sw.js']
      },
      manifest: {
        name: 'DiaHealth',
        short_name: 'DiaHealth',
        description: 'مدیریت دارو و یادآوری بیماران دیابتی',
        lang: 'fa',
        dir: 'rtl',
        background_color: '#f2f6fa',
        theme_color: '#4a90e2',
        icons: [
          {
            src: 'diahealth-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  base: '/DiaHealth/'
})
