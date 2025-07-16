const express = require('express');
const dotenv = require('dotenv');
const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');

// Muat variabel dari file .env
dotenv.config();

// Inisialisasi Supabase Client dengan Service Role Key
// Ini memberinya akses penuh ke database Anda, mengabaikan semua RLS.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware yang sudah Anda miliki, tidak perlu diubah
app.use(express.json());

// --- Helper Functions ---

/**
 * Helper untuk memformat angka menjadi format mata uang Rupiah.
 * @param {number} value - Angka yang akan diformat.
 * @returns {string} - String dalam format Rp X.XXX.
 */
const formatCurrency = (value) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);

/**
 * Helper untuk memformat tanggal menjadi format yang lebih mudah dibaca.
 * @param {string} dateString - String tanggal dari Supabase.
 * @returns {string} - String tanggal dalam format lokal.
 */
const formatDate = (dateString) => 
  new Date(dateString).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

/**
 * Fungsi ini membuat template HTML untuk struk berdasarkan data transaksi.
 * Memisahkannya ke fungsi sendiri membuat kode endpoint lebih bersih.
 * @param {object} tx - Objek data transaksi lengkap dari Supabase.
 * @returns {string} - String HTML yang siap diubah menjadi PDF.
 */
function generateReceiptHTML(tx) {
  const formatCurrency = (value) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);

  const formatDate = (dateString) => 
    new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

  const itemsHTML = tx.transaction_items.map(item => `
    <tr>
      <td class="item-cell" colspan="2">
        <div class="item-name">${item.products.name}</div>
        ${item.product_variants ? `<div class="item-variant">${item.product_variants.name}</div>` : ''}
        <div class="item-details">${item.quantity} &times; ${formatCurrency(item.price_per_item)}</div>
      </td>
      <td class="item-total">${formatCurrency(item.total_price)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Struk Transaksi</title>
      <style>
        /* CSS yang disederhanakan dan dibuat lebih andal */
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif; /* Menggunakan font sistem yang aman */
          font-size: 10px;
          color: #000;
          width: 76mm; /* Sedikit lebih kecil dari 80mm untuk margin */
          margin: 0;
          padding: 0;
        }
        .receipt {
          width: 100%;
          padding: 2mm;
          box-sizing: border-box;
        }
        .header { text-align: center; margin-bottom: 8px; }
        .header h1 { font-size: 16px; font-weight: bold; margin: 0; padding: 0; }
        .header p { margin: 1px 0; }
        
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 3px 0; vertical-align: top; }

        .details-table td { padding: 1px 0; }
        
        .items-header-row th {
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 4px 0;
          text-align: left;
        }
        .items-header-row .total-header { text-align: right; }

        .item-cell { line-height: 1.4; }
        .item-name { font-weight: bold; }
        .item-variant { font-size: 9px; color: #333; }
        .item-details { font-size: 9px; }
        .item-total { text-align: right; font-weight: bold; }

        .summary-table { margin-top: 8px; border-top: 1px dashed #000; }
        .summary-table td { padding: 1px 0; }
        .summary-table .label { text-align: left; }
        .summary-table .value { text-align: right; }
        .summary-table .total .label,
        .summary-table .total .value {
          font-weight: bold;
          font-size: 12px;
        }
        .footer { text-align: center; margin-top: 10px; padding-top: 5px; }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1>${tx.outlets.businesses.name}</h1>
          <p>${tx.outlets.name}</p>
          <p>${tx.outlets.address || ''}</p>
        </div>

        <table class="details-table">
          <tr><td>No. Struk:</td><td style="text-align:right;">${tx.id.slice(0, 8).toUpperCase()}</td></tr>
          <tr><td>Tanggal:</td><td style="text-align:right;">${formatDate(tx.created_at)}</td></tr>
          <tr><td>Kasir:</td><td style="text-align:right;">${tx.profiles.full_name || 'N/A'}</td></tr>
        </table>

        <table>
          <thead>
            <tr class="items-header-row">
              <th colspan="2">Item</th>
              <th class="total-header">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <table class="summary-table">
          <tr><td class="label">Subtotal</td><td class="value">${formatCurrency(tx.total_amount)}</td></tr>
          ${tx.discount_amount > 0 ? `<tr><td class="label">Diskon</td><td class="value">- ${formatCurrency(tx.discount_amount)}</td></tr>` : ''}
          ${tx.tax_amount > 0 ? `<tr><td class="label">Pajak</td><td class="value">${formatCurrency(tx.tax_amount)}</td></tr>` : ''}
          ${tx.service_charge_amount > 0 ? `<tr><td class="label">Biaya Layanan</td><td class="value">${formatCurrency(tx.service_charge_amount)}</td></tr>` : ''}
          <tr class="total"><td class="label">TOTAL</td><td class="value">${formatCurrency(tx.final_amount)}</td></tr>
          <tr><td class="label">Pembayaran</td><td class="value">${tx.payment_method}</td></tr>
        </table>
        
        <div class="footer">
          <p>Terima kasih atas kunjungan Anda!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// --- Endpoints API ---

// Endpoint dasar Anda, tidak berubah
app.get('/', (req, res) => {
  res.send('🎉 Halo dari Backend Kustom Finako! Server berjalan dengan baik.');
});

// Endpoint yang sudah diisi dengan logika penuh
app.post('/generate-receipt', async (req, res) => {
  const { transaction_id } = req.body;
  console.log(`[API] Menerima permintaan struk untuk transaksi: ${transaction_id}`);

  if (!transaction_id) {
    return res.status(400).json({ error: 'ID Transaksi dibutuhkan.' });
  }

  try {
    // 1. Mengambil data transaksi lengkap (kode ini sudah benar)
    const { data: transaction, error: queryError } = await supabase
      .from('transactions')
      .select(`
        *,
        profiles ( full_name ),
        outlets ( name, address, businesses ( name ) ),
        transaction_items (
          *,
          products ( name ),
          product_variants ( name )
        )
      `)
      .eq('id', transaction_id)
      .single();

    if (queryError) throw queryError;
    if (!transaction) return res.status(404).json({ error: 'Transaksi tidak ditemukan.' });

    // 2. Membuat konten HTML dari data transaksi (kode ini sudah benar)
    const htmlContent = generateReceiptHTML(transaction);

    // --- LANGKAH DEBUGGING: UPLOAD FILE HTML MENTAH ---
    const htmlFilePath = `debug/${transaction_id}.html`;
    const { error: htmlUploadError } = await supabase.storage
      .from('receipts') // Kita gunakan bucket yang sama
      .upload(htmlFilePath, htmlContent, {
        contentType: 'text/html',
        upsert: true,
      });

    if (htmlUploadError) {
      console.error('[API Error] Gagal upload file HTML:', htmlUploadError);
      // Jangan hentikan proses, kita tetap coba buat PDF
    }
    // --- AKHIR LANGKAH DEBUGGING ---

    // 3. Menggunakan Puppeteer untuk mengubah HTML menjadi PDF
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium',
      headless: 'new', // 'new' adalah mode headless modern, ini sudah bagus
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage', // Penting untuk environment dengan memori terbatas
        '--no-zygote', // Kadang diperlukan di env Linux tertentu
        '--single-process' // Menjalankan dalam satu proses, lebih stabil
      ]
    });
    const page = await browser.newPage();

    // Kembali ke setContent, ini lebih direct
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
    
    const pdfBuffer = await page.pdf({
      width: '80mm',
      printBackground: true,
    });
    
    await browser.close();

    // 4. Meng-upload buffer PDF (kode ini sudah benar)
    const pdfFilePath = `${transaction_id}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(pdfFilePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // 5. Mendapatkan URL publik dari PDF
    const { data: publicUrlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(pdfFilePath);

    console.log(`[API] Struk PDF berhasil dibuat: ${publicUrlData.publicUrl}`);
    
    // 6. Mengembalikan URL publik ke frontend
    res.status(200).json({
      message: 'Struk PDF berhasil dibuat.',
      url: `${publicUrlData.publicUrl}?t=${Date.now()}` // Tambahkan cache buster
    });

  } catch (error) {
    console.error('[API Error] Gagal membuat struk:', error);
    res.status(500).json({ error: 'Terjadi kesalahan di server saat membuat struk.', details: error.message });
  }
});

// --- Menjalankan Server ---
app.listen(PORT, () => {
  console.log(`🚀 Backend Finako berjalan dan siap menerima permintaan di http://localhost:${PORT}`);
});