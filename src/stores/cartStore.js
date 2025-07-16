import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUIStore } from './userStoreRefactored'; // Untuk notifikasi
import { useUserStoreRefactored } from './userStoreRefactored';


export const useCartStore = defineStore('cart', () => {
  const uiStore = useUIStore();

  // --- STATE ---
  const userStore = useUserStoreRefactored();
  const items = ref([]); // Berisi { ...product, quantity: number, cartItemId: string }
  const customer = ref(null);

  // --- GETTERS (Tidak berubah, tapi sekarang akan bekerja) ---
  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const subtotal = computed(() => {
    return items.value.reduce((sum, item) => {
      // Pastikan item memiliki harga yang valid sebelum dijumlahkan
      const price = item.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  });
  const taxAmount = computed(() => {
    // Ambil persentase dari userStore, default 0 jika tidak ada
    const taxRate = (userStore.business?.tax_percent ?? 0) / 100;
    if (taxRate === 0) return 0;
    
    // Pajak dihitung dari subtotal
    return Math.round(subtotal.value * taxRate);
  });

  // Getter untuk menghitung jumlah Biaya Layanan
  const serviceChargeAmount = computed(() => {
    const serviceRate = (userStore.business?.service_charge_percent ?? 0) / 100;
    if (serviceRate === 0) return 0;
    
    // Biaya layanan juga dihitung dari subtotal
    return Math.round(subtotal.value * serviceRate);
  });

  // Getter untuk TOTAL AKHIR yang harus dibayar
  const grandTotal = computed(() => {
    return subtotal.value + taxAmount.value + serviceChargeAmount.value;
  });

  // --- ACTIONS ---

  /**
   * Menambah produk ke keranjang.
   * Jika produk sudah ada, hanya menambah jumlahnya.
   * Jika belum, menambahkan item baru.
   */
  function addProductToCart(product) {
    // Untuk produk varian, kita akan tangani nanti. Untuk sekarang, fokus pada produk tunggal.
    if (product.has_variants) {
        uiStore.showNotification('Pemilihan varian belum diimplementasikan.', 'info');
        // TODO: Buka modal pemilihan varian
        return;
    }
    
    const existingItem = items.value.find(item => item.id === product.id);

    if (existingItem) {
      // Jika produk sudah ada, tambah quantity
      existingItem.quantity++;
    } else {
      // Jika produk baru, tambahkan ke keranjang dengan quantity 1
      items.value.push({
        ...product,
        quantity: 1,
        cartItemId: `${product.id}-${Date.now()}` // ID unik untuk keperluan v-for
      });
    }
    uiStore.showNotification(`${product.name} ditambahkan ke keranjang.`, 'success', 1500);
  }
  function addVariantToCart(variant) {
    // Di sini, `variant` adalah objek lengkap dengan harga dan nama produk master
    const existingItem = items.value.find(item => item.id === variant.id); // Varian ID unik
  
    if (existingItem) {
      existingItem.quantity++;
    } else {
      items.value.push({
        ...variant,
        name: `${variant.product_name} - ${variant.name}`, // Gabungkan nama, mis: "Kopi Susu - Dingin"
        quantity: 1,
        cartItemId: `${variant.id}-${Date.now()}`
      });
    }
    uiStore.showNotification(`${variant.name} ditambahkan ke keranjang.`, 'success', 1500);
  }
  /**
   * Mengubah jumlah item di keranjang.
   * Jika jumlah menjadi 0 atau kurang, item akan dihapus.
   */
  function updateQuantity(cartItemId, newQuantity) {
    const itemIndex = items.value.findIndex(item => item.cartItemId === cartItemId);
    if (itemIndex === -1) return;

    if (newQuantity > 0) {
      items.value[itemIndex].quantity = newQuantity;
    } else {
      // Hapus item jika quantity 0 atau kurang
      items.value.splice(itemIndex, 1);
    }
  }

  /**
   * Menambah jumlah item sebanyak 1.
   */
  function incrementQuantity(cartItemId) {
    const item = items.value.find(item => item.cartItemId === cartItemId);
    if (item) {
      item.quantity++;
    }
  }

  /**
   * Mengurangi jumlah item sebanyak 1.
   */
  function decrementQuantity(cartItemId) {
    const itemIndex = items.value.findIndex(item => item.cartItemId === cartItemId);
    if (itemIndex > -1) {
      items.value[itemIndex].quantity--;
      if (items.value[itemIndex].quantity <= 0) {
        items.value.splice(itemIndex, 1);
      }
    }
  }
  
  /**
   * Menghapus item dari keranjang berdasarkan cartItemId-nya.
   */
  function removeItem(cartItemId) {
      const itemIndex = items.value.findIndex(item => item.cartItemId === cartItemId);
      if (itemIndex > -1) {
          items.value.splice(itemIndex, 1);
      }
  }

  /**
   * Mengosongkan seluruh keranjang.
   */
  function clearCart() {
    items.value = [];
    customer.value = null;
    uiStore.showNotification('Keranjang dikosongkan.', 'info', 1500);
  }

  return {
    items,
    customer,
    totalItems,
    subtotal,
    taxAmount,
    serviceChargeAmount,
    grandTotal,
    addProductToCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    removeItem,
    clearCart,
    addVariantToCart,
  };
});