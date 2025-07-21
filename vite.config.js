import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow access from network (e.g., ngrok)
    allowedHosts: [
      'localhost',
      'd6ad-41-209-10-50.ngrok-free.app' // Optional: ngrok during development
    ],
  },
  build: {
    outDir: 'dist', // Vercel expects built output here
    emptyOutDir: true,
  },
})
