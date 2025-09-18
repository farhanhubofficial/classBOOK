import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',                 // ← IMPORTANT: use root so built assets use absolute paths
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
