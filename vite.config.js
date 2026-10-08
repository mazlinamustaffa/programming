import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE_PATH || '/programming/',
  optimizeDeps: { include: ['JSCPP'] },
  build: {
    rollupOptions: {
      output: {
        manualChunks: { charts: ['recharts'] },
      },
    },
  },
})
