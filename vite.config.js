import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Setiap request di frontend yang dimulai dengan '/api'
      // akan diteruskan ke server backend Anda.
      '/api': {
        target: 'http://localhost:3000', // Server backend berjalan di port 3000
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Hapus '/api' dari path
      },
    }
  }
})