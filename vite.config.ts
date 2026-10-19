import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// VITE_BASE lets the GitHub Pages workflow serve the app from /fatoora/.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
