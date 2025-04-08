import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'd6ad-41-209-10-50.ngrok-free.app', // Add your ngrok host here
      'localhost', // Optionally allow localhost if needed
    ],
  },
})
