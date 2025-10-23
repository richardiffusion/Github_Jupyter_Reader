import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist', // make sure the output directory is 'dist'
    sourcemap: false, // disable sourcemap in production to reduce file size
  },
  base: './', // use relative paths to ensure it works correctly in sub-paths
})