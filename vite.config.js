export default defineConfig({
  plugins: [react()],
  base: '', // let Vercel serve from root
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
