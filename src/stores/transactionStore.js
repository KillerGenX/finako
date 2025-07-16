import { defineStore } from 'pinia';
import { supabase } from '@/supabase';
import { useUserStoreRefactored } from './userStoreRefactored';
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
        };

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
        // Untuk sekarang, kita lakukan satu per satu
        for (const item of cartStore.items) {
          // TODO: Buat fungsi RPC `update_stock` untuk menangani ini secara transaksional
          // agar jika salah satu gagal, semua dibatalkan.
          await supabase.rpc('update_stock_on_sale', {
              p_id: item.has_variants ? item.product_id : item.id,
              v_id: item.has_variants ? item.id : null,
              o_id: userStore.activeOutletId,
              sale_qty: item.quantity
          });
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