const functions = require('@google-cloud/functions-framework');
const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');
const { generateReceiptHTML } = require('./templates/receipt');

// Inisialisasi Supabase Client.
// Variabel ini akan disuntikkan oleh Cloud Run saat deployment.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * HTTP Cloud Function / Cloud Run Service yang membuat struk PDF.
 * Nama 'generateReceipt' adalah entry point yang akan kita daftarkan.
 */
functions.http('generateReceipt', async (req, res) => {
  // Mengatur header CORS untuk mengizinkan panggilan.
  // Dalam arsitektur kita, hanya backend Express yang akan memanggil ini.
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Menangani preflight request dari browser/axios
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { transaction_id } = req.body;

  if (!transaction_id) {
    return res.status(400).json({ error: 'transaction_id is required' });
  }

  try {
    // 1. Ambil data transaksi lengkap dari Supabase
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
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    // 2. Buat konten HTML dari template yang terpisah
    const htmlContent = generateReceiptHTML(transaction);

    // 3. Gunakan Puppeteer untuk mengubah HTML menjadi PDF
    const browser = await puppeteer.launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      width: '80mm',
      printBackground: true,
      margin: { top: '10px', right: '5px', bottom: '10px', left: '5px' }
    });
    await browser.close();

    // 4. Upload buffer PDF ke Supabase Storage
    const filePath = `public/${transaction_id}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // 5. Dapatkan URL publik dari file yang baru di-upload
    const { data: publicUrlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('Failed to get public URL for the PDF.');
    }

    // 6. Kembalikan URL ke pemanggil (backend Express kita)
    console.log(`Successfully generated PDF for tx: ${transaction_id}`);
    res.status(200).json({ url: publicUrlData.publicUrl });

  } catch (error) {
    console.error(`Error generating PDF for tx: ${transaction_id}`, error);
    res.status(500).json({ error: 'Internal server error while generating PDF.', details: error.message });
  }
});