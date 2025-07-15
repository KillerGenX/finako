import { defineStore } from 'pinia';
import { ref } from 'vue'; // Kita tidak butuh `computed` di sini lagi
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
  
  // --- ACTIONS ---

  // Mengambil semua data awal untuk halaman stok secara efisien
  async function fetchStockPageData() {
    if (!userStore.businessId) return;
    isLoading.value = true;
    error.value = null;

    try {
      // Kita butuh data outlet untuk memfilter mutasi dengan benar
      const { data: outletsData } = await supabase
        .from('outlets')
        .select('id')
        .eq('business_id', userStore.businessId);

      if (!outletsData) throw new Error("Gagal mengambil data outlet.");
      
      const outletIds = outletsData.map(o => o.id);

      const [ingredientsRes, ingredientStocksRes, movementsRes] = await Promise.all([
        supabase.from('ingredients').select('*').eq('business_id', userStore.businessId).order('name'),
        supabase.from('ingredient_outlets').select('*, outlets!inner(business_id)').eq('outlets.business_id', userStore.businessId),
        
        // ========================================================
        // === INI QUERY MUTASI YANG SUDAH DIPERBAIKI ===
        // ========================================================
        // Kita ambil semua mutasi yang outlet_id-nya ada di dalam daftar
        // outlet milik bisnis ini. Ini jauh lebih efisien.
        supabase.from('ingredient_stock_movements')
                .select('*, ingredients(name)') // kita hanya butuh nama ingredient
                .in('outlet_id', outletIds) // Gunakan .in() untuk mencocokkan dengan array ID outlet
                .order('created_at', { ascending: false })
                .limit(100), // Batasi untuk performa awal
      ]);
      // ========================================================


      if (ingredientsRes.error) throw ingredientsRes.error;
      if (ingredientStocksRes.error) throw ingredientStocksRes.error;
      if (movementsRes.error) throw movementsRes.error;

      ingredients.value = ingredientsRes.data || [];
      ingredientStocks.value = ingredientStocksRes.data || [];
      stockMovements.value = movementsRes.data || [];

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
      // Kita akan memisahkan logika untuk TAMBAH dan EDIT
      if (ingredientData.id) {
        // --- LOGIKA UNTUK EDIT (karena ada ID) ---
        const { error } = await supabase
          .from('ingredients')
          .update({
            name: ingredientData.name,
            unit: ingredientData.unit,
          })
          .eq('id', ingredientData.id);

        if (error) throw error;
        uiStore.showNotification('Bahan baku berhasil diperbarui!', 'success');

      } else {
        // --- LOGIKA UNTUK TAMBAH BARU (karena ID null/tidak ada) ---
        const { error } = await supabase
          .from('ingredients')
          .insert({
            name: ingredientData.name,
            unit: ingredientData.unit,
            business_id: userStore.businessId,
          });

        if (error) throw error;
        uiStore.showNotification('Bahan baku berhasil ditambahkan!', 'success');
      }
      
      // Setelah salah satu operasi berhasil, refresh data
      await fetchStockPageData();
      return true;

    } catch(e) {
      uiStore.showNotification(`Error: ${e.message}`, 'error');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function saveIngredientStock(stockData) {
    isLoading.value = true;
    try {
       // PERBAIKAN: Kita hanya menyertakan kolom yang benar-benar
       // ada di tabel 'ingredient_outlets' sesuai skema Anda.
       const payload = {
           ingredient_id: stockData.ingredient_id,
           outlet_id: stockData.outlet_id,
           stock_quantity: stockData.stock_quantity,
           min_stock: stockData.min_stock,
           is_active: stockData.is_active,
       };

       // 'upsert' akan bekerja dengan benar karena kita memberikannya
       // `onConflict` constraint yang ada di skema Anda.
       const { error } = await supabase.from('ingredient_outlets').upsert(payload, { 
           onConflict: 'ingredient_id, outlet_id' 
       });

       if (error) throw error;

       await fetchStockPageData(); // Refresh data untuk menampilkan stok terbaru
       uiStore.showNotification('Stok bahan baku berhasil diperbarui.', 'success');
       return true;

    } catch(e) {
       console.error(e);
       uiStore.showNotification(`Error: ${e.message}`, 'error');
       return false;
    } finally {
       isLoading.value = false;
    }
 }
 // ============================================


  
  // Aksi untuk menghapus master bahan baku
  async function deleteIngredient(ingredientId) {
     if (!confirm('Yakin ingin menghapus bahan baku ini? Ini tidak bisa dibatalkan.')) return;
     isLoading.value = true;
     try {
        const { error } = await supabase.from('ingredients').delete().eq('id', ingredientId);
        if (error) {
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
  async function addStockMovement(movementData) {
    isLoading.value = true;
    try {
      // 1. Ambil data stok saat ini (logika ini sudah benar)
      const { data: currentStock, error: stockError } = await supabase
        .from('ingredient_outlets')
        .select('id, stock_quantity')
        .eq('ingredient_id', movementData.ingredient_id)
        .eq('outlet_id', movementData.outlet_id)
        .maybeSingle(); // Menggunakan maybeSingle lebih aman

      if (stockError) throw stockError;
      
      let newStockQuantity = parseFloat(currentStock?.stock_quantity || 0);
      const movementQuantity = parseFloat(movementData.quantity);

      // 2. Hitung jumlah stok baru (logika ini sudah benar)
      if (movementData.movement_type === 'masuk') {
        newStockQuantity += movementQuantity;
      } else if (movementData.movement_type === 'keluar') {
        newStockQuantity -= movementQuantity;
      } else if (movementData.movement_type === 'penyesuaian') {
        newStockQuantity = movementQuantity;
      }
      
      if (newStockQuantity < 0) newStockQuantity = 0;

      // 3. Siapkan payload TANPA business_id yang tidak perlu
      const movementPayload = {
        ingredient_id: movementData.ingredient_id,
        outlet_id: movementData.outlet_id,
        movement_type: movementData.movement_type,
        quantity: movementData.quantity,
        ref: movementData.ref,
      };
      
      const stockPayload = {
        ingredient_id: movementData.ingredient_id,
        outlet_id: movementData.outlet_id,
        stock_quantity: newStockQuantity,
      };

      // 4. Jalankan perintah ke database
      const [movementResult, stockResult] = await Promise.all([
        supabase.from('ingredient_stock_movements').insert(movementPayload),
        supabase.from('ingredient_outlets').upsert(stockPayload, { onConflict: 'ingredient_id, outlet_id' })
      ]);
      
      if (movementResult.error) throw movementResult.error;
      if (stockResult.error) throw stockResult.error;

      // 5. Refresh data
      await fetchStockPageData();
      uiStore.showNotification('Mutasi stok berhasil dicatat!', 'success');
      return true;

    } catch (e) {
      console.error(e);
      uiStore.showNotification(`Error: ${e.message}`, 'error');
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  // Semua state dan actions yang diekspor
  return {
    ingredients,
    ingredientStocks,
    stockMovements,
    isLoading,
    error,
    fetchStockPageData,
    saveIngredient,
    deleteIngredient,
    saveIngredientStock,
    addStockMovement,
  };
}); // <-- Kurung penutup yang benar ada di sini