import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Keep generic vendor splits, but let Vite own the scene graph chunking so
    // the React.lazy SceneCanvas boundary stays fully async.
    // The default 500 kB warning is too low for this dedicated scene payload.
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      output: {
        manualChunks(id) {
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
