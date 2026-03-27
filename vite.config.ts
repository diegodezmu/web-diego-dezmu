import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // The WebGL runtime is intentionally isolated in an async R3F chunk.
    // The default 500 kB warning is too low for this dedicated scene payload.
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('/node_modules/three/') ||
            id.includes('/three/build/') ||
            id.includes('/three/src/')
          ) {
            return 'three-core'
          }

          if (id.includes('@react-three/fiber/dist/events-')) {
            return 'r3f-events'
          }

          if (id.includes('@react-three/fiber')) {
            return 'r3f-core'
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
