import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'
import { useUserStoreRefactored } from './userStoreRefactored' // Kita gunakan store user yang sudah diperbaiki
import { useUIStore } from './userStoreRefactored'; // UI Store kita ada di sana

export const useProductStore = defineStore('product', () => {
    // Memanggil store user untuk mendapatkan info penting seperti ID bisnis
    const userStore = useUserStoreRefactored()

    // --- STATE ---
    // Tempat menyimpan semua data mentah yang kita dapat dari Supabase
    const products = ref([])
    const categories = ref([])
    const outlets = ref([])
    // Data bahan baku per outlet akan kita simpan di sini
const ingredients = ref([]) // Untuk menyimpan daftar bahan baku (master data)
const ingredientStocks = ref([]) // Untuk menyimpan HANYA info stok per outlet

    // State untuk mengontrol UI: status loading, pesan error, dll.
    const isLoading = ref(false)
    const error = ref(null)

    // State untuk filter dan outlet yang sedang aktif
    const activeOutletId = ref(null)
    const filters = ref({
        searchQuery: '',
        categoryId: '',
    })

    // --- GETTERS (Data Siap Tampil) ---
    // Di sini kita olah data mentah menjadi informasi yang siap ditampilkan di halaman
   const productsWithDetails = computed(() => {
    if (!activeOutletId.value) return [];

    return products.value.map(p => {
        const categoryName = categories.value.find(c => c.id === p.category_id)?.name || '-';
        
        let calculatedStock = 0;
        let priceDisplay = 0;

        if (p.has_variants) {
            // KALKULASI STOK PRODUK DENGAN VARIAN
            calculatedStock = p.product_variants.reduce((total, variant) => {
                const variantOutletInfo = variant.product_variant_outlets.find(pvo => pvo.outlet_id === activeOutletId.value);
                return total + (variantOutletInfo?.stock_quantity ?? 0);
            }, 0);
            priceDisplay = 'Lihat Varian';

        } else if (p.is_composite) {
            // KALKULASI STOK PRODUK RESEP (KOMPOSIT)
            if (p.product_recipes.length > 0) {
                let minPossible = Infinity;
                p.product_recipes.forEach(recipe => {
                    const stockInfo = ingredientStocks.value.find(is => 
                        is.ingredient_id === recipe.ingredient_id && is.outlet_id === activeOutletId.value
                    );
                    const availableStock = stockInfo?.stock_quantity ?? 0;
                    if (recipe.quantity_used > 0) {
                        const canMake = Math.floor(availableStock / recipe.quantity_used);
                        if (canMake < minPossible) {
                            minPossible = canMake;
                        }
                    }
                });
                calculatedStock = minPossible === Infinity ? 0 : minPossible;
            }
            const outletInfo = p.product_outlets.find(po => po.outlet_id === activeOutletId.value);
            priceDisplay = outletInfo?.price ?? 0;

        } else {
            // PRODUK TUNGGAL BIASA
            const outletInfo = p.product_outlets.find(po => po.outlet_id === activeOutletId.value);
            calculatedStock = outletInfo?.stock_quantity ?? 0;
            priceDisplay = outletInfo?.price ?? 0;
        }

        return {
            ...p,
            categoryName,
            stock: calculatedStock,
            price: priceDisplay,
        };
    });
});

const productsForSale = computed(() => {
    const activeOutlet = userStore.activeOutletId;
    if (!activeOutlet) {
     // console.warn("productsForSale: activeOutletId belum di-set!"); //
      return [];
    }
  
    // LOGIKA SEMENTARA UNTUK DEBUGGING
    // Tampilkan semua produk, kita hanya butuh nama dan harganya untuk sekarang.
    return products.value.map(p => {
      let price = 0;
      
      if (p.has_variants) {
        // Cari harga varian pertama sebagai contoh
        const firstVariant = p.product_variants?.[0];
        const outletInfo = firstVariant?.product_variant_outlets?.find(pvo => pvo.outlet_id === activeOutlet);
        price = outletInfo?.price ?? 0;
      } else {
        const outletInfo = p.product_outlets.find(po => po.outlet_id === activeOutlet);
        price = outletInfo?.price ?? 0;
      }
      
     // console.log(`Produk: ${p.name}, Harga: ${price}`); // Tambahkan console.log untuk cek
  
      return {
        ...p,
        price: price || 0, // Pastikan ada nilai default
      };
    });
  });

const filteredProducts = computed(() => {
    let result = productsWithDetails.value;

    if (filters.value.searchQuery) {
        const s = filters.value.searchQuery.toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(s));
    }

    if (filters.value.categoryId) {
        result = result.filter(p => p.category_id === filters.value.categoryId);
    }
    return result;
});

    // --- ACTIONS (Perintah untuk Manajer Gudang) ---

    // Perintah untuk "Ambil semua data awal!"
async function fetchInitialData() {
    if (!userStore.businessId) return;
    isLoading.value = true;
    error.value = null;

    try {
        // Gunakan query cerdas Anda yang sudah terbukti bekerja
        const [outletsRes, categoriesRes, ingredientsWithStockRes] = await Promise.all([
            supabase.from('outlets').select('*').eq('business_id', userStore.businessId),
            supabase.from('categories').select('*').eq('business_id', userStore.businessId),
            supabase.from('ingredients')
                    .select(`id, name, unit, ingredient_outlets(*)`) // Query dari ingredients
                    .eq('business_id', userStore.businessId)
        ]);

        if (outletsRes.error) throw outletsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;
        if (ingredientsWithStockRes.error) throw ingredientsWithStockRes.error;

        outlets.value = outletsRes.data || [];
        categories.value = categoriesRes.data || [];

        // --- INI BAGIAN PENTING YANG DIPERBAIKI ---
        // Kita proses data yang datang untuk mengisi DUA state terpisah
        const allIngredients = [];
        const allIngredientStocks = [];

        (ingredientsWithStockRes.data || []).forEach(ingredient => {
            // 1. Simpan data masternya (nama, unit) ke `allIngredients`
            allIngredients.push({
                id: ingredient.id,
                name: ingredient.name,
                unit: ingredient.unit
            });

            // 2. Simpan data stoknya ke `allIngredientStocks`
            ingredient.ingredient_outlets.forEach(stockInfo => {
                allIngredientStocks.push(stockInfo);
            });
        });

        // Set state dengan data yang sudah diproses dan dipisah
        ingredients.value = allIngredients;
        ingredientStocks.value = allIngredientStocks;
        // ---------------------------------------------

        if (outlets.value.length > 0 && !activeOutletId.value) {
            activeOutletId.value = outlets.value[0].id;
        }

        await fetchProducts();

    } catch (e) {
        error.value = `Gagal mengambil data awal: ${e.message}`;
        console.error("Detail error fetchInitialData:", e);
    } finally {
        isLoading.value = false;
    }
}

    // Perintah untuk "Ambil data produk sekarang!"
   async function fetchProducts() {
    if (!userStore.businessId) return;
    isLoading.value = true;
    error.value = null;
    try {
        const { data, error: queryError } = await supabase
            .from('products')
            .select(`
                *,
                product_outlets ( outlet_id, stock_quantity, price ),
                product_variants ( *, product_variant_outlets (outlet_id, stock_quantity, price) ),
                product_recipes ( quantity_used, ingredient_id )
            `)
            .eq('business_id', userStore.businessId);

        if (queryError) throw queryError;
        products.value = data || [];
    } catch (e) {
        error.value = `Gagal mengambil produk: ${e.message}`;
    } finally {
        isLoading.value = false;
    }
}

// --- ACTIONS UNTUK KATEGORI ---

async function addCategory(categoryName) {
    if (!categoryName.trim()) {
        alert('Nama kategori tidak boleh kosong.');
        return null; // Kembalikan null jika gagal
    }
    if (!userStore.businessId) {
        alert('ID Bisnis tidak ditemukan.');
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('categories')
            .insert({ name: categoryName, business_id: userStore.businessId })
            .select()
            .single(); // Ambil data kategori yang baru dibuat

        if (error) throw error;

        // Tambahkan kategori baru ke state lokal tanpa perlu fetch ulang
        categories.value.push(data);
        return data; // Kembalikan data kategori baru

    } catch (e) {
        console.error("Gagal menambah kategori:", e.message);
        alert(`Gagal menambah kategori: ${e.message}`);
        return null;
    }
}

async function deleteCategory(categoryId) {
    if (!categoryId) return;

    // Konfirmasi sebelum menghapus
    if (!confirm("Yakin ingin menghapus kategori ini? Ini tidak bisa dibatalkan.")) {
        return false;
    }

    try {
        // Cek dulu apakah kategori ini masih digunakan oleh produk
        const { data: productsUsingCategory, error: checkError } = await supabase
            .from('products')
            .select('id')
            .eq('category_id', categoryId)
            .limit(1);

        if (checkError) throw checkError;

        if (productsUsingCategory && productsUsingCategory.length > 0) {
            alert('Kategori tidak bisa dihapus karena masih digunakan oleh produk lain.');
            return false;
        }

        // Jika tidak digunakan, baru hapus
        const { error: deleteError } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);

        if (deleteError) throw deleteError;

        // Hapus dari state lokal
        const index = categories.value.findIndex(c => c.id === categoryId);
        if (index > -1) {
            categories.value.splice(index, 1);
        }
        alert('Kategori berhasil dihapus.');
        return true;

    } catch(e) {
        console.error("Gagal menghapus kategori:", e.message);
        alert(`Gagal menghapus kategori: ${e.message}`);
        return false;
    }
}

async function updateCategory(categoryId, newName) {
    if (!newName.trim()) {
        alert('Nama kategori tidak boleh kosong.');
        return false;
    }

    try {
        const { error } = await supabase
            .from('categories')
            .update({ name: newName })
            .eq('id', categoryId);

        if (error) throw error;

        // Update state lokal agar UI langsung berubah
        const index = categories.value.findIndex(c => c.id === categoryId);
        if (index > -1) {
            categories.value[index].name = newName;
        }
        return true;

    } catch(e) {
        console.error("Gagal mengupdate kategori:", e.message);
        alert(`Gagal mengupdate kategori: ${e.message}`);
        return false;
    }
}

    // Perintah untuk "Tambah produk baru!"
 // Fungsi pembantu untuk upload foto
async function uploadProductPhoto(productId, photoFile) {
    if (!photoFile) return null;

    // Buat path unik untuk file, misal: products/product_id/timestamp.jpg
    const fileExt = photoFile.name.split('.').pop();
    const filePath = `products/${productId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('product-photos') // Pastikan nama bucket Anda benar
        .upload(filePath, photoFile);

    if (uploadError) {
        console.error("Gagal mengupload foto:", uploadError.message);
        throw new Error("Gagal mengupload foto produk.");
    }

    // Ambil URL publik dari foto yang baru diupload
    const { data } = supabase.storage.from('product-photos').getPublicUrl(filePath);
    return data.publicUrl;
}


// Aksi untuk MENAMBAH produk baru
async function addProduct({ formData, photoFile }) {
    isLoading.value = true;
    try {
        // 1. Insert data produk utama (tanpa varian, resep, dan foto)
        const productPayload = {
            name: formData.name,
            category_id: formData.category_id,
            description: formData.description,
            has_variants: formData.has_variants,
            is_composite: formData.is_composite,
            business_id: userStore.businessId,
        };

        const { data: newProduct, error: productError } = await supabase
            .from('products')
            .insert(productPayload)
            .select()
            .single();

        if (productError) throw productError;
        const productId = newProduct.id;

        // 2. Upload foto jika ada, lalu update URL di produk
        const photoUrl = await uploadProductPhoto(productId, photoFile);
        if (photoUrl) {
            const { error: photoUpdateError } = await supabase
                .from('products')
                .update({ photo_url: photoUrl })
                .eq('id', productId);
            if (photoUpdateError) throw photoUpdateError;
            newProduct.photo_url = photoUrl; // Update objek lokal juga
        }

        // 3. Insert varian jika ada
        if (formData.has_variants && formData.product_variants.length > 0) {
            const variantsPayload = formData.product_variants.map(v => ({
                product_id: productId,
                name: v.name,
                price: v.price,
                sku: v.sku,
            }));
            const { error: variantError } = await supabase.from('product_variants').insert(variantsPayload);
            if (variantError) throw variantError;
        }
        if (formData.is_composite && formData.product_recipes.length > 0) {
            const recipesPayload = formData.product_recipes.map(r => ({
                product_id: productId,
                ingredient_id: r.ingredient_id,
                quantity_used: r.quantity_used,
            }));
            const { error: recipeError } = await supabase.from('product_recipes').insert(recipesPayload);
            if (recipeError) throw recipeError;
        }
        
        

        // 4. Refresh daftar produk di halaman
        await fetchProducts();
        useUIStore().showNotification('Produk baru berhasil ditambahkan!', 'success');

    } catch (e) {
        console.error("Gagal menambah produk:", e);
        useUIStore().showNotification(`Error: ${e.message}`, 'error');
    } finally {
        isLoading.value = false;
    }
}

// Aksi untuk MENGUPDATE produk yang ada
async function updateProduct({ formData, photoFile }) {
    isLoading.value = true;
    const productId = formData.id;
    try {
        // 1. Upload foto baru jika ada
        let photoUrl = formData.photo_url;
        if (photoFile) {
            photoUrl = await uploadProductPhoto(productId, photoFile);
        }

        // 2. Update data produk utama
        const productPayload = {
            name: formData.name,
            category_id: formData.category_id,
            description: formData.description,
            has_variants: formData.has_variants,
            is_composite: formData.is_composite,
            photo_url: photoUrl,
        };
        const { error: productError } = await supabase.from('products').update(productPayload).eq('id', productId);
        if (productError) throw productError;
        
        // 3. Sinkronisasi Varian (Hapus -> Insert)
        await supabase.from('product_variants').delete().eq('product_id', productId);
        if (formData.has_variants && formData.product_variants.length > 0) {
            const variantsPayload = formData.product_variants.map(v => ({
                product_id: productId, name: v.name, price: v.price, sku: v.sku
            }));
            const { error: variantError } = await supabase.from('product_variants').insert(variantsPayload);
            if (variantError) throw variantError;
        }

        // 4. Sinkronisasi Resep (Hapus -> Insert)
        await supabase.from('product_recipes').delete().eq('product_id', productId);
        if (formData.is_composite && formData.product_recipes.length > 0) {
            const recipesPayload = formData.product_recipes.map(r => ({
                product_id: productId, ingredient_id: r.ingredient_id, quantity_used: r.quantity_used
            }));
            const { error: recipeError } = await supabase.from('product_recipes').insert(recipesPayload);
            if (recipeError) throw recipeError;
        }

        // 5. Refresh daftar produk
        await fetchProducts();
        useUIStore().showNotification('Produk berhasil diperbarui!', 'success');

    } catch (e) {
        console.error("Gagal mengupdate produk:", e);
        useUIStore().showNotification(`Error: ${e.message}`, 'error');
    } finally {
        isLoading.value = false;
    }
}
    
     // Perintah untuk "Hapus produk!"
   async function deleteProduct(productId) {
    if (!productId) return;

    // Konfirmasi dari pengguna adalah praktik yang baik
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini? Semua data terkait (varian, stok) akan ikut terhapus dan tidak bisa dikembalikan.")) {
        return;
    }

    isLoading.value = true;
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) throw error;
        
        // Hapus produk dari state lokal agar UI langsung update tanpa perlu fetch ulang
        const index = products.value.findIndex(p => p.id === productId);
        if (index > -1) {
            products.value.splice(index, 1);
        }

        useUIStore().showNotification('Produk berhasil dihapus.', 'success');

    } catch(e) {
        console.error("Gagal menghapus produk:", e.message);
        useUIStore().showNotification(`Error: ${e.message}`, 'error');
    } finally {
        isLoading.value = false;
    }
}

async function saveProductStock(payload) {
    // payload = { product_id, outlet_id, stock_quantity, price, is_active }
    isLoading.value = true;
    try {
        const { error } = await supabase
            .from('product_outlets')
            .upsert(payload, { onConflict: 'product_id, outlet_id' }); // Update jika sudah ada, insert jika belum

        if (error) throw error;
        
        // Panggil fetchProducts untuk refresh data di halaman
        await fetchProducts(); 
        useUIStore().showNotification('Stok & harga berhasil diperbarui.', 'success');
        return true;

    } catch (e) {
        console.error("Gagal menyimpan stok produk:", e.message);
        useUIStore().showNotification(`Error: ${e.message}`, 'error');
        return false;
    } finally {
        isLoading.value = false;
    }
}

async function saveVariantStocks(variantsPayload) {
    // variantsPayload adalah array of objects, cth: [{ variant_id, outlet_id, ... }]
    isLoading.value = true;
    try {
        const { error } = await supabase
            .from('product_variant_outlets')
            .upsert(variantsPayload, { onConflict: 'variant_id, outlet_id' });

        if (error) throw error;
        
        await fetchProducts();
        useUIStore().showNotification('Stok & harga varian berhasil diperbarui.', 'success');
        return true;

    } catch(e) {
        console.error("Gagal menyimpan stok varian:", e.message);
        useUIStore().showNotification(`Error: ${e.message}`, 'error');
        return false;
    } finally {
        isLoading.value = false;
    }
}


    return {
    // State
    products,
    categories,
    outlets,
    ingredients,
    ingredientStocks, // Ganti dari ingredients ke ingredientStocks
    isLoading,
    error,
    activeOutletId,
    filters,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    updateCategory,
    saveProductStock,
    saveVariantStocks,

    // Getters
    filteredProducts, 
    productsForSale,  // Kita tetap pakai nama ini

    // Actions
    fetchInitialData,
    fetchProducts,
    // ... sisa actions Anda ...
}
})