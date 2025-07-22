import { defineStore } from 'pinia';
import { supabase } from '@/supabase';
import { useUserStoreRefactored, useUIStore } from './userStoreRefactored';
import { useCartStore } from './cartStore';

export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    isSubmitting: false,
  }),
  actions: {
    async submitTransaction(paymentDetails) {
      this.isSubmitting = true;
      const userStore = useUserStoreRefactored();
      const cartStore = useCartStore();

      try {
        console.log("Data diterima oleh submitTransaction:", paymentDetails);
        // 1. Siapkan data untuk tabel `transactions`
        const transactionData = {
          business_id: userStore.businessId,
          outlet_id: userStore.activeOutletId,
          user_id: userStore.userId,
          total_amount: cartStore.subtotal,
          tax_amount: cartStore.taxAmount,
          service_charge_amount: cartStore.serviceChargeAmount,
          final_amount: cartStore.grandTotal,
          payment_method: paymentDetails.payment_method,
          // --- PERUBAHAN DI SINI ---
          // Kita gunakan `|| null` untuk memastikan nilainya adalah NULL di database jika inputnya kosong.
          // Ini lebih konsisten untuk data.
          customer_name: paymentDetails.customer_name || null,
          customer_phone: paymentDetails.customer_phone || null,
          amount_paid: paymentDetails.amount_paid,
          change: paymentDetails.change,
        };
        console.log("Data yang akan di-INSERT ke Supabase:", transactionData);

        // 2. Simpan "kepala" transaksi dan dapatkan ID-nya
        const { data: newTransaction, error: transactionError } = await supabase
          .from('transactions')
          .insert(transactionData)
          .select()
          .single();

        if (transactionError) throw transactionError;

        // 3. Siapkan data untuk tabel `transaction_items`
        const transactionItemsData = cartStore.items.map(item => ({
          transaction_id: newTransaction.id,
          product_id: item.has_variants ? item.product_id : item.id,
          variant_id: item.has_variants ? item.id : null,
          quantity: item.quantity,
          price_per_item: item.price,
          total_price: item.price * item.quantity,
        }));
        
        // 4. Simpan semua item transaksi
        const { error: itemsError } = await supabase
          .from('transaction_items')
          .insert(transactionItemsData);

        if (itemsError) throw itemsError;

        // 5. Potong stok (ini bagian yang kompleks, kita bisa gunakan RPC nanti)
        for (const item of cartStore.items) {
          // Panggil RPC baru dengan nama baru dan parameter tambahan
          const { error: stockError } = await supabase.rpc('process_stock_deduction_on_sale', {
            p_product_id: item.has_variants ? item.product_id : item.id,
            p_variant_id: item.has_variants ? item.id : null,
            p_outlet_id: userStore.activeOutletId,
            p_sale_qty: item.quantity,
            p_transaction_id: newTransaction.id // <-- KIRIM ID TRANSAKSI DARI LANGKAH SEBELUMNYA
          });
        
          if (stockError) {
            // Tambahkan penanganan error jika pemotongan stok gagal
            console.error(`Gagal memotong stok untuk item ${item.name}:`, stockError);
            // Anda mungkin ingin menampilkan notifikasi error di sini juga
            uiStore.showNotification(`Gagal update stok untuk ${item.name}.`, 'error');
            // Mungkin Anda ingin menghentikan proses? Tergantung kebijakan bisnis Anda.
          }
        }
        
        // 6. Jika semua berhasil, bersihkan keranjang
        cartStore.clearCart();
        return { success: true, transactionId: newTransaction.id };

      } catch (error) {
        console.error("Gagal menyimpan transaksi:", error);
        // Tampilkan notifikasi error
        return { success: false, error: error.message };
      } finally {
        this.isSubmitting = false;
      }
    },


  },
});