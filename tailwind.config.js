/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [require('daisyui')],

  // --- TAMBAHKAN BLOK BARU INI DARI SINI ---
  // Konfigurasi spesifik untuk DaisyUI
  daisyui: {
    // `oklch: false` adalah kunci utamanya.
    // Perintah ini memaksa DaisyUI untuk menggunakan format warna lama (HSL)
    // yang sepenuhnya didukung oleh library html2canvas.
    oklch: false,
  },
  // --- SAMPAI SINI ---
}