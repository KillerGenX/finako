const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000; // Port untuk backend

// --- Konfigurasi CORS ---
// Daftar semua URL frontend yang diizinkan untuk mengakses backend ini.
const allowedOrigins = [
  'https://5173-firebase-finako-1752548583409.cluster-nzwlpk54dvagsxetkvxzbvslyi.cloudworkstations.dev'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan request jika origin (sumber) ada di dalam daftar `allowedOrigins`
    // atau jika request tidak memiliki origin (misalnya, dari Postman, curl, atau server-side)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error('Akses CORS ditolak untuk origin:', origin);
      callback(new Error('Akses tidak diizinkan oleh kebijakan CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Metode yang diizinkan
  credentials: true, // Izinkan pengiriman cookies atau header otentikasi
};

// Terapkan middleware CORS dengan opsi yang sudah kita buat
app.use(cors(corsOptions));
app.use(express.json());


// --- Endpoints API ---

// Endpoint dasar untuk mengecek apakah server berjalan
app.get('/', (req, res) => {
  res.send('🎉 Halo dari Backend Kustom Finako! Server berjalan dengan baik.');
});

// Endpoint untuk uji coba pembuatan PDF
app.post('/generate-receipt', (req, res) => {
  const { transaction_id } = req.body;

  console.log(`[API] Menerima permintaan struk untuk transaksi: ${transaction_id}`);

  if (!transaction_id) {
    return res.status(400).json({ error: 'ID Transaksi dibutuhkan.' });
  }

  res.status(200).json({ 
    message: `Permintaan struk untuk transaksi ${transaction_id} diterima.`,
    pdf_url: null
  });
});


// --- Menjalankan Server ---
app.listen(PORT, () => {
  console.log(`🚀 Backend Finako berjalan dan siap menerima permintaan di http://localhost:${PORT}`);
});