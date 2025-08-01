import * as XLSX from 'xlsx-js-style';

export function useExporter() {
  const exportToStyledExcel = (jsonData, reportTitle, dateRange, fileName = 'laporan.xlsx') => {
    if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    // Definisikan Style
    const titleStyle = { font: { bold: true, sz: 16 }, alignment: { horizontal: "center" } };
    const dateStyle = { font: { italic: true, sz: 10 }, alignment: { horizontal: "center" } };
    const headerStyle = {
      font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } }, // Warna Indigo (mirip primary)
      alignment: { horizontal: "center", vertical: "center" },
      border: { bottom: { style: "thin", color: { rgb: "000000" } } }
    };
    const cellStyle = { alignment: { vertical: "center" } };

    // =========================================================
    // === PERUBAHAN UTAMA: Buat Header dan Data secara terpisah ===
    // =========================================================

    // 1. Ambil nama-nama kolom dari objek PERTAMA sebagai header
    const headers = Object.keys(jsonData[0]);
    // 2. Ubah array objek menjadi array dari array (format yang disukai SheetJS)
    const dataRows = jsonData.map(row => headers.map(header => row[header]));

    // 3. Gabungkan semuanya: Judul + Tanggal + Baris Kosong + Header + Data
    const finalData = [
      [reportTitle],
      [dateRange],
      [], // Baris kosong sebagai pemisah
      headers,
      ...dataRows
    ];

    // 4. Buat worksheet dari data yang sudah terstruktur ini
    const ws = XLSX.utils.aoa_to_sheet(finalData);

    // 5. Merge sel untuk Judul dan Tanggal
    const columnCount = headers.length;
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: columnCount - 1 } }
    ];

    // 6. Terapkan Style
    if (ws['A1']) ws['A1'].s = titleStyle;
    if (ws['A2']) ws['A2'].s = dateStyle;
    const columnWidths = [];
    headers.forEach((header, index) => {
      // Style untuk header (sekarang di baris ke-3, index 2)
      const cellAddress = XLSX.utils.encode_cell({c: index, r: 3});
      if (ws[cellAddress]) ws[cellAddress].s = headerStyle;

      // Hitung lebar kolom
      const headerWidth = header.length;
      const dataMaxWidth = Math.max(...dataRows.map(row => String(row[index] || '').length));
      columnWidths.push({ wch: Math.max(headerWidth, dataMaxWidth, 10) + 2 });
    });
    ws['!cols'] = columnWidths;

    // Terapkan style alignment ke semua data cell
    dataRows.forEach((row, rowIndex) => {
        headers.forEach((header, colIndex) => {
             const cellAddress = XLSX.utils.encode_cell({c: colIndex, r: rowIndex + 4}); // +4 karena data mulai dari baris 4
             if(ws[cellAddress]) {
                 ws[cellAddress].s = cellStyle;
             }
        });
    });

    // 7. Buat Workbook dan download
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, fileName);
  };

  const exportSalesReportExcel = (salesData, reportTitle, dateRange, fileName = 'laporan-penjualan.xlsx') => {
    const { summary, topProducts, transactions } = salesData;
    
    if (!summary || !transactions || transactions.length === 0) {
      alert("Tidak ada data penjualan untuk diekspor.");
      return;
    }

    // Style definitions
    const titleStyle = { font: { bold: true, sz: 16 }, alignment: { horizontal: "center" } };
    const dateStyle = { font: { italic: true, sz: 12 }, alignment: { horizontal: "center" } };
    const sectionHeaderStyle = { font: { bold: true, sz: 14 }, fill: { fgColor: { rgb: "E5E7EB" } } };
    const kpiLabelStyle = { font: { bold: true, sz: 11 } };
    const kpiValueStyle = { font: { bold: true, sz: 11 }, numFmt: '#,##0' };
    const currencyStyle = { numFmt: '#,##0' };
    const headerStyle = {
      font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } },
      alignment: { horizontal: "center", vertical: "center" }
    };

    // Prepare data structure
    const ws_data = [
      [reportTitle], // Row 0
      [dateRange],   // Row 1
      [],            // Row 2 - empty
      ["RINGKASAN PENJUALAN"], // Row 3
      [],            // Row 4 - empty
      ["Omzet Kotor (Rp)", summary.total_revenue || 0], // Row 5
      ["Laba Kotor (Rp)", summary.total_profit || 0],   // Row 6
      ["Produk Terjual (Pcs)", summary.total_items_sold || 0], // Row 7  
      ["Jumlah Transaksi", summary.transaction_count || 0],    // Row 8
      [],            // Row 9 - empty
    ];

    // Add top products section if available
    let currentRow = 10;
    if (topProducts && topProducts.length > 0) {
      ws_data.push(["PRODUK TERLARIS"]);
      ws_data.push([]);
      ws_data.push(["Nama Produk", "Qty Terjual", "Total Omzet (Rp)"]);
      
      topProducts.slice(0, 5).forEach(product => {
        ws_data.push([
          product.product_name,
          product.quantity_sold,
          product.total_revenue
        ]);
      });
      ws_data.push([]);
      currentRow = ws_data.length;
    }

    // Add transactions section
    ws_data.push(["DETAIL TRANSAKSI"]);
    ws_data.push([]);
    const transactionHeaders = ["Tanggal", "ID Transaksi", "Outlet", "Kasir", "Metode Bayar", "Total (Rp)"];
    ws_data.push(transactionHeaders);

    // Add transaction data with proper number formatting
    transactions.forEach(tx => {
      ws_data.push([
        new Date(tx.created_at).toLocaleString('id-ID', { 
          year: '2-digit', month: '2-digit', day: '2-digit', 
          hour: '2-digit', minute: '2-digit' 
        }),
        tx.id.slice(-8).toUpperCase(),
        tx.outlet_name || '-',
        tx.cashier_name || '-',
        tx.payment_method,
        tx.final_amount // Keep as number for Excel calculations
      ]);
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Apply styles and formatting
    const maxCol = Math.max(6, transactionHeaders.length) - 1;

    // Title and date merging
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: maxCol } }, // Title
      { s: { r: 1, c: 0 }, e: { r: 1, c: maxCol } }  // Date
    ];

    // Apply styles
    if (ws['A1']) ws['A1'].s = titleStyle;
    if (ws['A2']) ws['A2'].s = dateStyle;
    if (ws['A4']) ws['A4'].s = sectionHeaderStyle;

    // KPI section styling
    ['A6', 'A7', 'A8', 'A9'].forEach(cell => {
      if (ws[cell]) ws[cell].s = kpiLabelStyle;
    });
    ['B6', 'B7', 'B8', 'B9'].forEach(cell => {
      if (ws[cell]) ws[cell].s = kpiValueStyle;
    });

    // Top products section styling
    if (topProducts && topProducts.length > 0) {
      const topProductsStartRow = 11;
      if (ws[`A${topProductsStartRow}`]) ws[`A${topProductsStartRow}`].s = sectionHeaderStyle;
      
      // Top products header
      const tpHeaderRow = topProductsStartRow + 2;
      ['A', 'B', 'C'].forEach((col, idx) => {
        const cell = `${col}${tpHeaderRow}`;
        if (ws[cell]) ws[cell].s = headerStyle;
      });

      // Top products currency formatting
      for (let i = 0; i < Math.min(topProducts.length, 5); i++) {
        const dataRow = tpHeaderRow + 1 + i;
        if (ws[`C${dataRow}`]) ws[`C${dataRow}`].s = currencyStyle;
      }
    }

    // Transaction section styling
    const transactionStartRow = ws_data.length - transactions.length - 2;
    if (ws[`A${transactionStartRow}`]) ws[`A${transactionStartRow}`].s = sectionHeaderStyle;

    // Transaction headers
    const txHeaderRow = transactionStartRow + 2;
    transactionHeaders.forEach((header, idx) => {
      const col = String.fromCharCode(65 + idx);
      const cell = `${col}${txHeaderRow}`;
      if (ws[cell]) ws[cell].s = headerStyle;
    });

    // Transaction currency column formatting
    for (let i = 0; i < transactions.length; i++) {
      const dataRow = txHeaderRow + 1 + i;
      const totalCol = String.fromCharCode(65 + transactionHeaders.length - 1);
      if (ws[`${totalCol}${dataRow}`]) {
        ws[`${totalCol}${dataRow}`].s = currencyStyle;
      }
    }

    // Column widths
    ws['!cols'] = [
      { wch: 20 }, // Date/Label
      { wch: 15 }, // ID/Value  
      { wch: 15 }, // Outlet
      { wch: 15 }, // Kasir
      { wch: 12 }, // Method
      { wch: 15 }  // Total
    ];

    // Create workbook and save
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan");
    XLSX.writeFile(wb, fileName);
  };

  return { exportToStyledExcel, exportSalesReportExcel };
}