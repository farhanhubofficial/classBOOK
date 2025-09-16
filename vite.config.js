import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '', // ✅ important: empty string so assets resolve correctly
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
