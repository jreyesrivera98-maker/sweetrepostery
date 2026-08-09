import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/generate-image': {
        target: 'https://free-image-generation-api.jreyesrivera98.workers.dev/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/generate-image/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react'
            if (id.includes('@radix-ui')) return 'vendor-radix'
            if (id.includes('lucide')) return 'vendor-ui'
            if (id.includes('date-fns') || id.includes('zustand') || id.includes('zod') || id.includes('react-hook-form')) return 'vendor-utils'
            return 'vendor'
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
