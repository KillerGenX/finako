import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '@/supabase';
import { useUserStoreRefactored } from './userStoreRefactored';

export const useReportStore = defineStore('report', () => {
  const userStore = useUserStoreRefactored();

  // State yang terstruktur untuk Laporan Absensi
  const attendanceReport = ref({
    data: [],
    loading: false,
    error: null,
  });

  const salesReport = ref({
    summary: null,
    top_products: [],
    daily_sales_trend: [],
    transaction_list: [],
    loading: false,
    error: null,
  });

  const stockCardReport = ref({
    data: [],
    initialStockSnapshot: 0,
    loading: false,
    error: null,
  });


  // State untuk laporan lain di masa depan
  // const salesReport = ref({ ... });

  /**
   * Mengambil data laporan absensi dari database.
   * Menerima sebuah objek filter yang berisi startDate dan endDate.
   * @param {Object} filters - Objek filter.
   * @param {Date} filters.startDate - Objek Date untuk tanggal mulai.
   * @param {Date} filters.endDate - Objek Date untuk tanggal selesai.
   * @param {string|null} filters.employeeId - ID pegawai opsional.
   * @param {string|null} filters.outletId - ID outlet opsional. (Belum diimplementasikan di RPC)
   */
  async function fetchAttendanceReport(filters) {
    attendanceReport.value.loading = true;
    attendanceReport.value.error = null;
    attendanceReport.value.data = []; // Selalu reset data saat memulai fetch

    if (!userStore.businessId) {
      attendanceReport.value.error = "Konteks bisnis tidak ditemukan.";
      attendanceReport.value.loading = false;
      return;
    }

    try {
      // 1. Siapkan parameter tanggal yang aman untuk dikirim ke Supabase
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      start.setHours(0, 0, 0, 0);       // Jam 00:00:00 di tanggal mulai
      end.setHours(23, 59, 59, 999); // Jam 23:59:59 di tanggal selesai

      // 2. Kirim dalam format ISO String (UTC), format paling aman
      const { data, error: rpcError } = await supabase.rpc('get_attendance_report', {
        p_business_id: userStore.businessId,
        p_start_date: start.toISOString(),
        p_end_date: end.toISOString(),
        p_employee_id: filters.employeeId || null,
      });

      if (rpcError) throw rpcError;
      
      attendanceReport.value.data = data || [];

    } catch (e) {
      console.error("Error fetching attendance report:", e);
      attendanceReport.value.error = e.message || "Terjadi kesalahan yang tidak diketahui.";
    } finally {
      attendanceReport.value.loading = false;
    }
  }

  async function fetchSalesReport(filters) {
    salesReport.value.loading = true;
    salesReport.value.error = null;

    if (!userStore.businessId) {
      salesReport.value.error = "ID Bisnis tidak ditemukan.";
      salesReport.value.loading = false;
      return;
    }

    try {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      // Panggil RPC baru kita
      const { data, error: rpcError } = await supabase.rpc('get_sales_report', {
        p_business_id: userStore.businessId,
        p_start_date: start.toISOString(),
        p_end_date: end.toISOString(),
        p_outlet_id: filters.outletId || null,
      });

      if (rpcError) throw rpcError;
      console.log('[reportStore] Data mentah dari RPC:', data);
      console.log(`[reportStore] Jumlah transaksi diterima dari RPC: ${data.transaction_list?.length}`);

      // Isi state dengan data yang sudah diproses oleh RPC
      salesReport.value.summary = data.summary || null;
      salesReport.value.top_products = data.top_products || [];
      salesReport.value.daily_sales_trend = data.daily_sales_trend || [];
      salesReport.value.transaction_list = data.transaction_list || [];

    } catch (e) {
      console.error("Error fetching sales report:", e);
      salesReport.value.error = e.message || "Terjadi kesalahan.";
    } finally {
      salesReport.value.loading = false;
    }
  }

  async function fetchStockCardReport(filters) {
    stockCardReport.value.loading = true;
    stockCardReport.value.error = null;
    stockCardReport.value.data = [];
  
    try {
      const { data, error } = await supabase.rpc('get_stock_card_report', {
          p_start_date: new Date(filters.startDate).toISOString(),
          p_end_date: new Date(filters.endDate).toISOString(),
          p_item_type: filters.itemType,
          p_item_id: filters.itemId,
          p_initial_stock: filters.initialStock // Kirim stok awal ke RPC
      });
      
      if (error) throw error;
      
      // Tidak perlu proses apa-apa lagi! Langsung simpan.
      stockCardReport.value.data = data || [];
  
    } catch (e) {
      stockCardReport.value.error = e.message;
      console.error("Gagal mengambil kartu stok:", e);
    } finally {
      stockCardReport.value.loading = false;
    }
  }


  return {
    attendanceReport,
    salesReport,
    stockCardReport,
    fetchAttendanceReport,
    fetchSalesReport,
    fetchStockCardReport,
  };
});