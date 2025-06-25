// File: vite.config.js

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // Impor modul 'path' dari Node.js

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // --- TAMBAHKAN BAGIAN INI DARI SINI ---
  resolve: {
    alias: {
      // Memberitahu Vite: jika ada path yang diawali dengan '@',
      // ganti dengan path absolut ke folder './src' kita.
      '@': path.resolve(__dirname, './src'),
    },
  },
  // --- SAMPAI SINI ---
})