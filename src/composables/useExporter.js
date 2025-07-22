import * as XLSX from 'xlsx-js-style';

export function useExporter() {
  const exportToStyledExcel = (jsonData, reportTitle, dateRange, fileName = 'laporan.xlsx') => {
    if (!jsonData || jsonData.length === 0) {
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
    ws['A1'].s = titleStyle;
    ws['A2'].s = dateStyle;

    const columnWidths = [];
    headers.forEach((header, index) => {
      // Style untuk header (sekarang di baris ke-3, index 2)
      const cellAddress = XLSX.utils.encode_cell({c: index, r: 3});
      ws[cellAddress].s = headerStyle;

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

  return { exportToStyledExcel };
}