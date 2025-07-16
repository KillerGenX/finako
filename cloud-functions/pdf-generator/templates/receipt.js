const formatCurrency = (value) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
  
  // Helper untuk format tanggal yang mudah dibaca.
  const formatDate = (dateString) => 
    new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  
  // Fungsi ini diekspor untuk digunakan di index.js
  // Bertanggung jawab hanya untuk membuat string HTML.
  module.exports.generateReceiptHTML = (transaction) => {
    // Membuat setiap baris item di dalam struk
    const itemsHTML = transaction.transaction_items.map(item => `
      <div class="item">
        <div>
          <p class="item-name">${item.products.name}</p>
          ${item.product_variants ? `<p class="item-variant">${item.product_variants.name}</p>` : ''}
          <p class="item-details">${item.quantity} x ${formatCurrency(item.price_per_item)}</p>
        </div>
        <p class="item-total">${formatCurrency(item.total_price)}</p>
      </div>
    `).join('');
  
    // Mengembalikan template HTML lengkap
    return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Struk Transaksi ${transaction.id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
          body { 
            font-family: 'Poppins', 'Helvetica Neue', sans-serif; 
            margin: 0; 
            padding: 12px; 
            font-size: 10px; 
            color: #1a1a1a; 
            background-color: #fff;
            width: 80mm; 
            box-sizing: border-box;
          }
          .receipt { width: 100%; }
          .header { text-align: center; margin-bottom: 12px; }
          .header h1 { margin: 0; font-size: 16px; font-weight: 600; }
          .header p { margin: 2px 0; font-size: 10px; }
          .details, .summary { border-top: 1px dashed #999; padding-top: 8px; margin-top: 8px; }
          .details p, .summary p { margin: 4px 0; display: flex; justify-content: space-between; }
          .items-list { padding-top: 8px; margin-top: 8px; border-top: 1px dashed #999; }
          .item { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
          .item-name { font-weight: 600; margin: 0; }
          .item-variant { font-size: 9px; color: #555; margin: 0 0 2px 0; }
          .item-details { color: #555; margin: 0; }
          .item-total { font-weight: 600; text-align: right; }
          .summary .total { font-size: 12px; font-weight: 600; }
          .footer { text-align: center; margin-top: 12px; padding-top: 8px; border-top: 1px dashed #999; font-size: 9px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>${transaction.outlets.businesses.name}</h1>
            <p>${transaction.outlets.name}</p>
            <p>${transaction.outlets.address || ''}</p>
          </div>
          <div class="details">
            <p><span>No. Struk:</span> <span>${transaction.id.slice(0, 8).toUpperCase()}</span></p>
            <p><span>Tanggal:</span> <span>${formatDate(transaction.created_at)}</span></p>
            <p><span>Kasir:</span> <span>${transaction.profiles.full_name || 'N/A'}</span></p>
          </div>
          <div class="items-list">${itemsHTML}</div>
          <div class="summary">
            <p><span>Subtotal</span> <span>${formatCurrency(transaction.total_amount)}</span></p>
            ${transaction.discount_amount > 0 ? `<p><span>Diskon</span> <span>- ${formatCurrency(transaction.discount_amount)}</span></p>` : ''}
            ${transaction.tax_amount > 0 ? `<p><span>Pajak</span> <span>${formatCurrency(transaction.tax_amount)}</span></p>` : ''}
            ${transaction.service_charge_amount > 0 ? `<p><span>Biaya Layanan</span> <span>${formatCurrency(transaction.service_charge_amount)}</span></p>` : ''}
            <p class="total"><span>TOTAL</span> <span>${formatCurrency(transaction.final_amount)}</span></p>
            <p><span>Pembayaran</span> <span>${transaction.payment_method}</span></p>
          </div>
          <div class="footer"><p>Terima kasih atas kunjungan Anda!</p></div>
        </div>
      </body>
      </html>
    `;
  };