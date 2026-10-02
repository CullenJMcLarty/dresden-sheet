/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works under any GitHub Pages path.
export default defineConfig({
  base: './',
  plugins: [react()],
  // Listen on all interfaces so other devices on the LAN can connect.
  server: { host: true },
  preview: { host: true },
  test: {
    environment: 'node',
  },
})
