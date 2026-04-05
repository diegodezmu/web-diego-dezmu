import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // The dedicated 3D vendor chunk remains above Vite's default 500 kB budget,
    // but it is now intentionally isolated for browser cache reuse.
    chunkSizeWarningLimit: 962,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('/node_modules/three/') ||
            id.includes('/node_modules/@react-three/fiber/') ||
            id.includes('/node_modules/@react-three/drei/')
          ) {
            return 'three-vendor'
          }

          if (id.includes('/node_modules/gsap/')) {
            return 'gsap'
          }

          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/react-router/') ||
            id.includes('/node_modules/react-router-dom/')
          ) {
            return 'react-vendor'
          }

          if (id.includes('/node_modules/zustand/')) {
            return 'zustand'
          }

          return undefined
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
