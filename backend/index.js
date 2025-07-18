const express = require('express');
const dotenv = require('dotenv');
const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

// === Konfigurasi & Inisialisasi ===
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Inisialisasi Supabase Client dengan Service Role Key
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Middleware
app.use(cors({ origin: '*' }));
// Tingkatkan batas ukuran payload dari body request untuk menerima string HTML
app.use(express.json({ limit: '5mb' }));


// === Helper & Template ===
// TIDAK DIPERLUKAN LAGI: Fungsi formatCurrency, formatDate, dan generateReceiptHTML dihapus.
// Semua logika ini sekarang ada di frontend (ThermalReceipt.vue).


// === Endpoints API ===
app.get('/', (req, res) => {
  res.send('🎉 Finako Backend v1.0 berjalan di VM!');
});

// === ENDPOINT YANG DIUBAH SECARA TOTAL ===
app.post('/generate-receipt', async (req, res) => {
  // 1. Ambil data dari body request
  const { transaction_id, html_content } = req.body;

  // 2. Validasi input
  if (!transaction_id || !html_content) {
    return res.status(400).json({ error: 'transaction_id and html_content are required' });
  }

  console.log(`[PDF] Menerima permintaan berbasis HTML untuk tx: ${transaction_id}`);

  try {
    // 3. Langsung gunakan Puppeteer untuk mengubah HTML menjadi PDF
    // TIDAK ADA LAGI QUERY KE DATABASE DI SINI.
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    // Gunakan setContent untuk memuat HTML yang dikirim dari frontend
    await page.setContent(html_content, { waitUntil: 'networkidle0' }); 
    const pdfBuffer = await page.pdf({ width: '80mm', printBackground: true });
    await browser.close();

    // 4. Tentukan path file di Supabase Storage (path sudah benar dari perubahan sebelumnya)
    const filePath = `${transaction_id}.pdf`;

    // 5. Upload PDF ke Supabase
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, pdfBuffer, { 
        contentType: 'application/pdf', 
        upsert: true 
      });

    if (uploadError) throw uploadError;

    // 6. Dapatkan URL publik dari PDF yang baru di-upload
    const { data: publicUrlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);
      
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('Failed to get public URL.');
    }

    console.log(`[PDF] Sukses membuat struk dari HTML untuk tx: ${transaction_id}`);
    res.status(200).json({ url: publicUrlData.publicUrl });

  } catch (error) {
    console.error(`[PDF] CRITICAL ERROR saat memproses HTML untuk tx: ${transaction_id}`, error);
    res.status(500).json({ error: 'Internal server error while generating PDF.', details: error.message });
  }
});
// ======================================


// === Menjalankan Server ===
// '0.0.0.0' penting agar server bisa diakses dari luar VM
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server Finako Backend berjalan di port ${PORT}`);
});