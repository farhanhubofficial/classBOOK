import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',   // ✅ always use absolute paths for Vercel
  build: {
    outDir: 'dist',
    emptyOutDir: true, // ✅ deletes old files so no stale hashes remain
  },
})
