import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  build: {
    outDir: 'dist', 
  },
  base: '/',
})
// server: {
//     host: '127.0.0.1',
//     port: 5173,
//   },