import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test-setup.ts',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: process.env.DOCKER_BUILD ? 'dist' : '../../wwwroot/react-apps/book-reviews-app',
    emptyOutDir: true,
  },
  base: process.env.DOCKER_BUILD || process.env.NODE_ENV === 'development' ? '/' : '/react-apps/book-reviews-app/',
})
