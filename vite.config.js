import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Make sure assets and routes resolve correctly on Vercel
  server: {
    host: true,
    allowedHosts: [
      'localhost',
      'd6ad-41-209-10-50.ngrok-free.app'
    ],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
