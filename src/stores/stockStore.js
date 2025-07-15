import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/supabase';
import { useUserStoreRefactored, useUIStore } from './userStoreRefactored';

export const useStockStore = defineStore('stock', () => {
  // Hubungkan ke store lain untuk konteks & notifikasi
  const userStore = useUserStoreRefactored();
  const uiStore = useUIStore();

  // --- STATE ---
  const ingredients = ref([]);      // Master data bahan baku
  const ingredientStocks = ref([]); // Data stok per outlet (dari tabel ingredient_outlets)
  const stockMovements = ref([]);   // Riwayat mutasi
  const isLoading = ref(false);
  const error = ref(null);
  
  // --- GETTERS (Data olahan untuk ditampilkan di View) ---
  const ingredientsWithStock = computed(() => {
    // Getter ini akan menggabungkan data master bahan baku dengan stoknya
    // di outlet yang sedang aktif, yang dipilih di UI.
    const currentOutletId = userStore.activeOutletId;
    if (!currentOutletId) return [];

    return ingredients.value.map(ing => {
      const stockInfo = ingredientStocks.value.find(s => 
        s.ingredient_id === ing.id && s.outlet_id === currentOutletId
      );
      return {
        ...ing,
        stock_quantity: stockInfo?.stock_quantity ?? 0,
        min_stock: stockInfo?.min_stock ?? 0,
        is_active: stockInfo?.is_active ?? false,
        stock_id: stockInfo?.id, // ID dari tabel ingredient_outlets, berguna untuk update
      };
    });
  });

  // --- ACTIONS ---

  // Mengambil semua data awal untuk halaman stok secara efisien
  async function fetchStockPageData() {
    if (!userStore.businessId) return;
    isLoading.value = true;
    error.value = null;

    try {
      const [ingredientsRes, ingredientStocksRes] = await Promise.all([
        supabase.from('ingredients').select('*').eq('business_id', userStore.businessId).order('name'),
         supabase.from('ingredient_outlets').select('*, outlets!inner(business_id)')
                                      .eq('outlets.business_id', userStore.businessId),
]);

      if (ingredientsRes.error) throw ingredientsRes.error;
      if (ingredientStocksRes.error) throw ingredientStocksRes.error;

      ingredients.value = ingredientsRes.data || [];
      ingredientStocks.value = ingredientStocksRes.data || [];

    } catch (e) {
      const errorMessage = `Gagal memuat data stok: ${e.message}`;
      error.value = errorMessage;
      uiStore.showNotification(errorMessage, 'error');
    } finally {
      isLoading.value = false;
    }
  }

  // Aksi untuk menyimpan (menambah/mengedit) master bahan baku
  async function saveIngredient(ingredientData) {
    isLoading.value = true;
    try {
      const payload = { ...ingredientData, business_id: userStore.businessId };
      const { data, error } = await supabase.from('ingredients').upsert(payload).select().single();
      if (error) throw error;
      
      await fetchStockPageData(); // Refresh data setelah menyimpan
      uiStore.showNotification('Bahan baku berhasil disimpan!', 'success');
      return data;

    } catch(e) {
      uiStore.showNotification(`Error: ${e.message}`, 'error');
    } finally {
      isLoading.value = false;
    }
  }
  
  // Aksi untuk menghapus master bahan baku
  async function deleteIngredient(ingredientId) {
     if (!confirm('Yakin ingin menghapus bahan baku ini? Ini tidak bisa dibatalkan.')) return;
     isLoading.value = true;
     try {
        const { error } = await supabase.from('ingredients').delete().eq('id', ingredientId);
        if (error) {
          // Cek jika error karena foreign key constraint
          if (error.code === '23503') {
            throw new Error('Bahan baku tidak bisa dihapus karena masih digunakan di resep atau stok.');
          }
          throw error;
        }
        await fetchStockPageData();
        uiStore.showNotification('Bahan baku berhasil dihapus.', 'success');

     } catch(e) {
        uiStore.showNotification(`Error: ${e.message}`, 'error');
     } finally {
        isLoading.value = false;
     }
  }
  
  // (Nanti kita akan tambahkan aksi lain seperti saveIngredientStock, saveStockMovement, dll)

  return {
    ingredients,
    ingredientStocks,
    stockMovements,
    isLoading,
    error,
    ingredientsWithStock,
    fetchStockPageData,
    saveIngredient,
    deleteIngredient,
  };
});