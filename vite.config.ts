import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_URL ?? '/',
  build: {
    target: ['safari12'],
  },
  test: {
    globals: true,
    environment: 'node',
  },
})
