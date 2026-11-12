/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In dev, forward API calls to the services started with `docker compose up` (or locally).
    proxy: {
      '/api/py': process.env.API_PYTHON_URL ?? 'http://localhost:8000',
      '/api/nest': process.env.API_NEST_URL ?? 'http://localhost:3000',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
