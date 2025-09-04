import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    svgr({
      svgrOptions: {
        exportType: 'default',
      },
    })
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: ['electron']
    }
  },
  publicDir: 'public',
  optimizeDeps: {
    exclude: ['electron']
  },
  server: {
    port: 5173,
    strictPort: true
  },
  define: {
    global: 'globalThis'
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
