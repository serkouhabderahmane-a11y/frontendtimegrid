import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: process.env.VERCEL === '1' ? '/' : '/',
  server: {
    port: 5173,
    host: true
  }
})
