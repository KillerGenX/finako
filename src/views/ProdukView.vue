<template>
  <div class="p-4">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
      <!-- Dropdown Outlet -->
      <div>
        <label class="block text-sm font-medium mb-1">Outlet</label>
        <select v-model="selectedOutlet" @change="fetchProducts" class="select select-bordered w-full max-w-xs">
          <option v-for="outlet in outlets" :key="outlet.id" :value="outlet.id">
            {{ outlet.name }}
          </option>
        </select>
      </div>
      <!-- Dropdown Kategori -->
      <div>
        <label class="block text-sm font-medium mb-1">Kategori</label>
        <div class="flex gap-2 items-center">
          <select v-model="selectedCategory" @change="fetchProducts" class="select select-bordered w-full">
            <option value="">Semua Kategori</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
          <button v-if="selectedCategory" class="btn btn-xs btn-error" @click="confirmDeleteCategory(selectedCategory)">
            <span class="material-icons" style="font-size:16px">delete</span>
          </button>
        </div>
      </div>
      <!-- Search -->
      <div class="flex-1">
        <label class="block text-sm font-medium mb-1">Cari Produk</label>
        <input v-model="search" @input="fetchProducts" type="text" placeholder="Cari nama/SKU..." class="input input-bordered w-full" />
      </div>
      <!-- Tambah Produk (Owner) -->
      <button v-if="isOwner" class="btn btn-primary mt-4 md:mt-0" @click="openAddModal">+ Tambah Produk</button>
    </div>

    <!-- Tabel Produk -->
    <div class="overflow-x-auto bg-white rounded shadow">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Foto</th>
            <th>Nama</th>
            <th>Kategori</th>
            <th>Stok</th>
            <th>Harga</th> <!-- Kolom Harga baru -->
            <th>Varian</th>
            <th>Outlet</th>
            <th v-if="isOwner">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prod in paginatedProducts" :key="prod.id">
            <td>
              <img :src="prod.photo_url || defaultPhoto" class="w-12 h-12 object-cover rounded" alt="foto produk" />
            </td>
            <td>{{ prod.name }}</td>
            <td>{{ getCategoryName(prod.category_id) }}</td>
            <td>
              <span>{{ getProductStock(prod.id) }}</span>
              <button v-if="isOwner" class="btn btn-xs btn-outline ml-2" @click="openStockModal(prod)">Atur Stok</button>
            </td>
            <td>
              <span v-if="prod.has_variants">
                <button class="btn btn-link btn-xs p-0 text-blue-600 underline" @click="openViewVarianModal(prod)">Lihat Varian</button>
              </span>
              <span v-else>{{ getProductPrice(prod.id) }}</span>
            </td>
            <td>
              <span v-if="prod.has_variants">Ya</span>
              <span v-else>Tidak</span>
            </td>
            <td>{{ getOutletName(selectedOutlet) }}</td>
            <td v-if="isOwner">
              <button class="btn btn-xs btn-warning mr-1" @click="openEditModal(prod)">Edit</button>
              <button class="btn btn-xs btn-error" @click="openDeleteModal(prod)">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginasi -->
    <div class="flex justify-end mt-4">
      <button class="btn btn-sm mr-2" :disabled="page === 1" @click="page--">&lt;</button>
      <span>Halaman {{ page }} / {{ totalPages }}</span>
      <button class="btn btn-sm ml-2" :disabled="page === totalPages" @click="page++">&gt;</button>
    </div>

    <!-- Modal Tambah/Edit/Hapus Produk (dummy, implementasi detail menyusul) -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 class="text-lg font-bold mb-4">{{ modalMode === 'add' ? 'Tambah' : modalMode === 'edit' ? 'Edit' : 'Hapus' }} Produk</h2>
        <!-- Form/modal content sesuai mode -->
        <div v-if="modalMode === 'delete'">
          <p>Yakin ingin menghapus produk <b>{{ selectedProduct?.name }}</b>?</p>
        </div>
        <div v-else>
          <div class="mb-2">
            <label class="block text-sm font-medium mb-1">Nama Produk</label>
            <input type="text" class="input input-bordered w-full" placeholder="Nama Produk" v-model="form.name" />
          </div>
          <div class="mb-2">
            <label class="block text-sm font-medium mb-1">Kategori</label>
            <div class="flex gap-2 items-center">
              <select v-model="form.category_id" class="select select-bordered w-full">
                <option value="">Pilih Kategori</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
              <button v-if="form.category_id" class="btn btn-xs btn-error" @click="confirmDeleteCategory(form.category_id)">
                <span class="material-icons" style="font-size:16px">delete</span>
              </button>
            </div>
            <div v-if="showAddCategory" class="flex mt-2 gap-2">
              <input type="text" v-model="newCategoryName" class="input input-bordered flex-1" placeholder="Nama kategori baru" @keyup.enter="addCategory" />
              <button class="btn btn-primary btn-sm" @click="addCategory">Simpan</button>
              <button class="btn btn-ghost btn-sm" @click="showAddCategory = false">Batal</button>
            </div>
            <button v-else class="btn btn-link btn-xs mt-1 p-0" @click="showAddCategory = true">+ Tambah Kategori</button>
          </div>
          <div class="mb-2">
            <label class="block text-sm font-medium mb-1">Foto Produk</label>
            <input type="file" accept="image/*" @change="onPhotoChange" />
            <div v-if="photoPreview" class="mt-2">
              <img :src="photoPreview" class="w-24 h-24 object-cover rounded border" alt="Preview Foto" />
              <button class="btn btn-xs btn-ghost ml-2" @click="removePhoto">Hapus</button>
            </div>
            <div v-else-if="form.photo_url" class="mt-2">
              <img :src="form.photo_url" class="w-24 h-24 object-cover rounded border" alt="Foto Produk" />
            </div>
          </div>
          <div class="mb-2">
            <label class="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea class="textarea textarea-bordered w-full" v-model="form.description" rows="2"></textarea>
          </div>
          <div class="flex gap-4 mb-2">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="form.has_variants" /> Varian
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="form.is_composite" /> Produk Komposit
            </label>
          </div>
          <!-- Tombol Kelola Varian -->
          <div v-if="form.has_variants" class="mb-2">
            <button class="btn btn-outline btn-sm" @click="showVarianModal = true">Kelola Varian</button>
            <span v-if="formVarian.length" class="ml-2 text-xs text-gray-500">({{ formVarian.length }} varian)</span>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button class="btn" @click="closeModal">Batal</button>
          <button v-if="modalMode === 'add'" class="btn btn-primary" @click="addProduct">Simpan</button>
          <button v-if="modalMode === 'edit'" class="btn btn-warning" @click="editProduct">Update</button>
          <button v-if="modalMode === 'delete'" class="btn btn-error" @click="deleteProduct">Hapus</button>
        </div>
      </div>
    </div>

    <!-- Modal Stok Produk per Outlet -->
    <div v-if="showStockModal" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow w-full max-w-sm" v-if="!stockModalProduct?.has_variants">
        <h2 class="text-lg font-bold mb-4">Atur Stok Produk</h2>
        <div class="mb-2">
          <label class="block text-sm font-medium mb-1">Produk</label>
          <input type="text" class="input input-bordered w-full" :value="stockModalProduct?.name" disabled />
        </div>
        <div class="mb-2">
          <label class="block text-sm font-medium mb-1">Outlet</label>
          <input type="text" class="input input-bordered w-full" :value="getOutletName(selectedOutlet)" disabled />
        </div>
        <div class="mb-2">
          <label class="block text-sm font-medium mb-1">Stok</label>
          <input type="number" class="input input-bordered w-full" v-model.number="stockForm.stock_quantity" min="0" />
        </div>
        <div class="mb-2">
          <label class="block text-sm font-medium mb-1">Harga (per outlet)</label>
          <input type="number" class="input input-bordered w-full" v-model.number="stockForm.price" min="0" />
        </div>
        <div class="mb-2 flex items-center gap-2">
          <input type="checkbox" v-model="stockForm.is_active" id="is_active" />
          <label for="is_active" class="text-sm">Aktifkan produk di outlet ini</label>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button class="btn" @click="closeStockModal">Batal</button>
          <button class="btn btn-primary" @click="saveProductStock">Simpan</button>
        </div>
      </div>
      <div class="bg-white p-6 rounded shadow w-full max-w-2xl max-h-[90vh] overflow-y-auto" v-else>
        <h2 class="text-lg font-bold mb-4">Atur Stok Varian Produk</h2>
        <div class="mb-2">
          <label class="block text-sm font-medium mb-1">Produk</label>
          <input type="text" class="input input-bordered w-full" :value="stockModalProduct?.name" disabled />
        </div>
        <div class="mb-2">
          <label class="block text-sm font-medium mb-1">Outlet</label>
          <input type="text" class="input input-bordered w-full" :value="getOutletName(selectedOutlet)" disabled />
        </div>
        <div v-if="variantStocks.length > 0">
          <table class="table w-full text-sm mb-2">
            <thead>
              <tr>
                <th>Nama Varian</th>
                <th>SKU</th>
                <th>Stok</th>
                <th>Harga</th>
                <th>Aktif</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(v, idx) in variantStocks" :key="v.variant_id">
                <td>{{ v.name }}</td>
                <td>{{ v.sku }}</td>
                <td>
                  <input type="number" class="input input-bordered input-xs w-20" v-model.number="variantStocks[idx].stock_quantity" min="0" />
                </td>
                <td>
                  <input type="number" class="input input-bordered input-xs w-28" v-model.number="variantStocks[idx].price" min="0" />
                </td>
                <td>
                  <input type="checkbox" v-model="variantStocks[idx].is_active" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center text-gray-400 mb-2">Belum ada varian</div>
        <div v-if="variantStockError" class="text-red-500 text-sm mb-2">{{ variantStockError }}</div>
        <div class="flex justify-end gap-2 mt-4">
          <button class="btn" @click="closeStockModal">Batal</button>
          <button class="btn btn-primary" :disabled="variantStockLoading || variantStocks.length === 0" @click="saveVariantStocks(stockModalProduct.id, selectedOutlet)">
            <span v-if="variantStockLoading" class="loading loading-spinner loading-xs mr-2"></span>Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Nested Varian -->
    <div v-if="showVarianModal" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-bold mb-4">Kelola Varian Produk</h3>
        <div class="flex flex-col md:flex-row gap-2 items-end mb-2">
          <input v-model="varianForm.name" placeholder="Nama Varian" class="input input-bordered w-full md:w-1/3" />
          <input v-model.number="varianForm.price" type="number" min="0" placeholder="Harga" class="input input-bordered w-full md:w-1/4" />
          <input v-model="varianForm.sku" placeholder="SKU (opsional)" class="input input-bordered w-full md:w-1/4" />
          <button @click="addVarian" class="btn btn-primary">{{ editingVarianIndex !== null ? 'Update' : 'Tambah' }}</button>
          <button v-if="editingVarianIndex !== null" @click="resetVarianForm" class="btn btn-secondary">Batal</button>
        </div>
        <table class="table w-full text-sm mb-2">
          <thead>
            <tr><th>Nama</th><th>Harga</th><th>SKU</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="(v, idx) in formVarian" :key="idx">
              <td>{{ v.name }}</td>
              <td>{{ v.price }}</td>
              <td>{{ v.sku }}</td>
              <td>
                <button @click="editVarian(idx)" class="btn btn-xs btn-info mr-1">Edit</button>
                <button @click="deleteVarian(idx)" class="btn btn-xs btn-error">Hapus</button>
              </td>
            </tr>
            <tr v-if="formVarian.length === 0"><td colspan="4" class="text-center text-gray-400">Belum ada varian</td></tr>
          </tbody>
        </table>
        <div class="flex justify-end mt-4">
          <button class="btn" @click="showVarianModal = false">Selesai</button>
        </div>
      </div>
    </div>

    <!-- Modal View Varian Produk (read-only) -->
    <div v-if="showViewVarianModal" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-bold mb-4">Daftar Varian: {{ viewVarianProduct?.name }}</h3>
        <table class="table w-full text-sm mb-2">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Harga</th>
              <th>SKU</th>
              <th>Stok</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in viewVarianList" :key="v.id">
              <td>{{ v.name }}</td>
              <td>{{ v.price }}</td>
              <td>{{ v.sku }}</td>
              <td>{{ v.stock_quantity }}</td>
              <td>
                <span :class="v.is_active ? 'text-green-600' : 'text-red-500'">
                  {{ v.is_active ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
            </tr>
            <tr v-if="viewVarianList.length === 0">
              <td colspan="5" class="text-center text-gray-400">Belum ada varian</td>
            </tr>
          </tbody>
        </table>
        <div class="flex justify-end mt-4">
          <button class="btn" @click="showViewVarianModal = false">Tutup</button>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus Kategori -->
    <div v-if="showDeleteCategoryConfirm" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow w-full max-w-sm">
        <h2 class="text-lg font-bold mb-4">Hapus Kategori</h2>
        <p>Yakin ingin menghapus kategori <b>{{ getCategoryName(categoryToDelete) }}</b>?</p>
        <div class="flex justify-end gap-2 mt-4">
          <button class="btn" @click="showDeleteCategoryConfirm = false">Batal</button>
          <button class="btn btn-error" @click="deleteCategory(categoryToDelete)">Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { supabase } from '../supabase';
import { useUserStore } from '../stores/userStore';

const userStore = useUserStore();
const isOwner = computed(() => userStore.role === 'Owner');
const businessId = computed(() => userStore.organizationId);
const defaultPhoto = '/public/finako.svg';

const outlets = ref([]);
const categories = ref([]);
const products = ref([]);
const selectedOutlet = ref('');
const selectedCategory = ref('');
const search = ref('');
const page = ref(1);
const pageSize = 10;
const showModal = ref(false);
const modalMode = ref('add'); // add | edit | delete
const selectedProduct = ref(null);
const form = ref({ name: '' });
const showAddCategory = ref(false);
const newCategoryName = ref('');
const showStockModal = ref(false);
const stockForm = ref({ product_id: '', stock_quantity: 0 });
const stockModalProduct = ref(null);
const productStocks = ref({}); // { [productId]: stock_quantity }
const productPrices = ref({}); // { [productId]: price }
const photoFile = ref(null);
const photoPreview = ref('');
const formVarian = ref([]); // [{name, price, sku}]
const editingVarianIndex = ref(null);
const varianForm = ref({ name: '', price: 0, sku: '' });
const showVarianModal = ref(false);
const showViewVarianModal = ref(false);
const viewVarianProduct = ref(null);
const viewVarianList = ref([]);
const variantStocks = ref([]); // [{variant_id, name, sku, stock_quantity, price, is_active}]
const variantStockError = ref('');
const variantStockLoading = ref(false);
const productVariantStocks = ref({}); // { [productId]: totalStock }
const showDeleteCategoryConfirm = ref(false);
const categoryToDelete = ref(null);

const paginatedProducts = computed(() => {
  let filtered = products.value;
  if (selectedCategory.value) filtered = filtered.filter(p => p.category_id === selectedCategory.value);
  if (search.value) {
    const s = search.value.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || (p.sku && p.sku.toLowerCase().includes(s)));
  }
  const start = (page.value - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
});
const totalPages = computed(() => Math.ceil(products.value.length / pageSize) || 1);

function getCategoryName(id) {
  return categories.value.find(c => c.id === id)?.name || '-';
}
function getOutletName(id) {
  return outlets.value.find(o => o.id === id)?.name || '-';
}
function getProductStock(productId) {
  const prod = products.value.find(p => p.id === productId);
  if (!prod) return 0;
  if (prod.has_variants) {
    // Ambil dari cache total stok varian
    return productVariantStocks.value[productId] ?? '-';
  } else {
    // Produk tanpa varian, ambil dari productStocks
    return productStocks.value[productId] ?? 0;
  }
}
function getProductPrice(productId) {
  const price = productPrices.value[productId];
  return price !== undefined ? `Rp${price.toLocaleString('id-ID')}` : '-';
}

async function fetchOutlets() {
  if (!businessId.value) return;
  const { data } = await supabase.from('outlets').select('*').eq('business_id', businessId.value);
  outlets.value = data || [];
  if (!selectedOutlet.value && outlets.value.length) selectedOutlet.value = outlets.value[0].id;
}
async function fetchCategories() {
  if (!businessId.value) return;
  const { data } = await supabase.from('categories').select('*').eq('business_id', businessId.value);
  categories.value = data || [];
}
async function fetchProducts() {
  if (!businessId.value) return;
  let query = supabase.from('products').select('*').eq('business_id', businessId.value);
  if (selectedCategory.value) query = query.eq('category_id', selectedCategory.value);
  // outlet_id opsional, tergantung implementasi stok per outlet
  const { data } = await query;
  products.value = data || [];
  page.value = 1;
}

async function fetchProductStocksAndPrices() {
  if (!selectedOutlet.value) return;
  // Ambil stok & harga produk per outlet dari tabel product_outlets
  const { data } = await supabase
    .from('product_outlets')
    .select('product_id, stock_quantity, price')
    .eq('outlet_id', selectedOutlet.value);
  productStocks.value = {};
  productPrices.value = {};
  if (data) {
    for (const row of data) {
      productStocks.value[row.product_id] = row.stock_quantity;
      productPrices.value[row.product_id] = row.price;
    }
  }
  // Ambil total stok varian per produk dari product_variant_outlets
  const { data: variantData } = await supabase
    .from('product_variant_outlets')
    .select('variant_id, stock_quantity, variant_id, outlet_id')
    .eq('outlet_id', selectedOutlet.value);
  productVariantStocks.value = {};
  if (variantData) {
    // Perlu mapping variant_id ke product_id
    // Ambil semua varian untuk produk di halaman
    const productIds = products.value.map(p => p.id);
    const { data: variants } = await supabase
      .from('product_variants')
      .select('id, product_id')
      .in('product_id', productIds);
    const variantToProduct = {};
    if (variants) {
      for (const v of variants) {
        variantToProduct[v.id] = v.product_id;
      }
    }
    for (const row of variantData) {
      const pid = variantToProduct[row.variant_id];
      if (pid) {
        if (!productVariantStocks.value[pid]) productVariantStocks.value[pid] = 0;
        productVariantStocks.value[pid] += row.stock_quantity || 0;
      }
    }
  }
}

async function fetchVariantStocks(productId, outletId) {
  // Ambil semua varian produk
  const { data: variants } = await supabase.from('product_variants').select('*').eq('product_id', productId);
  if (!variants) {
    variantStocks.value = [];
    return;
  }
  // Ambil stok/harga varian per outlet
  const { data: stocks } = await supabase.from('product_variant_outlets')
    .select('variant_id, stock_quantity, price, is_active')
    .eq('outlet_id', outletId);
  // Gabungkan data varian dengan stok/harga outlet
  variantStocks.value = variants.map(v => {
    const found = stocks?.find(s => s.variant_id === v.id);
    return {
      variant_id: v.id,
      name: v.name,
      sku: v.sku,
      stock_quantity: found?.stock_quantity ?? 0,
      price: found?.price ?? v.price,
      is_active: found?.is_active ?? true
    };
  });
}

async function saveVariantStocks(productId, outletId) {
  // Upsert semua variantStocks ke product_variant_outlets
  const payload = variantStocks.value.map(v => ({
    variant_id: v.variant_id,
    outlet_id: outletId,
    stock_quantity: v.stock_quantity,
    price: v.price,
    is_active: v.is_active
  }));
  const { error } = await supabase.from('product_variant_outlets').upsert(payload, { onConflict: ['variant_id', 'outlet_id'] });
  if (error) {
    alert('Gagal menyimpan stok/harga varian: ' + error.message);
    return;
  }
  showStockModal.value = false;
  await fetchProductStocksAndPrices();
}

async function fetchProductVariants(productId) {
  const { data, error } = await supabase.from('product_variants').select('*').eq('product_id', productId);
  if (error) {
    formVarian.value = [];
  } else {
    formVarian.value = data || [];
  }
}

function resetForm() {
  form.value = {
    name: '',
    category_id: '',
    description: '',
    has_variants: false,
    is_composite: false
  };
  formVarian.value = [];
  resetVarianForm();
}

function resetVarianForm() {
  varianForm.value = { name: '', price: 0, sku: '' };
  editingVarianIndex.value = null;
}

function validateForm() {
  if (!form.value.name) return 'Nama produk wajib diisi';
  if (!form.value.category_id) return 'Kategori wajib dipilih';
  if (form.value.has_variants && formVarian.value.length === 0) return 'Minimal 1 varian diperlukan';
  return null;
}

async function addProduct() {
  const errorMsg = validateForm();
  if (errorMsg) {
    alert(errorMsg);
    return;
  }
  // Insert produk dulu untuk dapatkan id
  const { data, error } = await supabase.from('products').insert([
    {
      name: form.value.name,
      category_id: form.value.category_id,
      description: form.value.description,
      has_variants: form.value.has_variants,
      is_composite: form.value.is_composite,
      business_id: businessId.value
    }
  ]).select();
  if (error || !data || !data[0]) {
    alert('Gagal menambah produk: ' + (error?.message || '')); 
    return;
  }
  const productId = data[0].id;
  // Upload foto jika ada
  const photoUrl = await uploadPhotoIfNeeded(productId);
  if (photoUrl) {
    await supabase.from('products').update({ photo_url: photoUrl }).eq('id', productId);
  }
  // Insert varian jika ada
  if (form.value.has_variants && formVarian.value.length > 0) {
    const variantsPayload = formVarian.value.map(v => ({
      product_id: productId,
      name: v.name,
      price: v.price,
      sku: v.sku
    }));
    const { error: varianError } = await supabase.from('product_variants').insert(variantsPayload);
    if (varianError) {
      alert('Gagal menyimpan varian: ' + varianError.message);
    }
  }
  closeModal();
  fetchProducts();
}

async function editProduct() {
  const errorMsg = validateForm();
  if (errorMsg) {
    alert(errorMsg);
    return;
  }
  let photoUrl = form.value.photo_url || '';
  if (photoFile.value) {
    photoUrl = await uploadPhotoIfNeeded(selectedProduct.value.id);
  }
  const { error } = await supabase.from('products').update({
    name: form.value.name,
    category_id: form.value.category_id,
    description: form.value.description,
    has_variants: form.value.has_variants,
    is_composite: form.value.is_composite,
    photo_url: photoUrl
  }).eq('id', selectedProduct.value.id);
  if (error) {
    alert('Gagal mengupdate produk: ' + (error.message || ''));
    return;
  }
  // Sync varian: hapus semua varian lama, insert ulang dari formVarian jika has_variants aktif
  if (form.value.has_variants) {
    // Hapus semua varian lama
    await supabase.from('product_variants').delete().eq('product_id', selectedProduct.value.id);
    // Insert ulang
    if (formVarian.value.length > 0) {
      const variantsPayload = formVarian.value.map(v => ({
        product_id: selectedProduct.value.id,
        name: v.name,
        price: v.price,
        sku: v.sku
      }));
      const { error: varianError } = await supabase.from('product_variants').insert(variantsPayload);
      if (varianError) {
        alert('Gagal menyimpan varian: ' + varianError.message);
      }
    }
  } else {
    // Jika has_variants dimatikan, hapus semua varian
    await supabase.from('product_variants').delete().eq('product_id', selectedProduct.value.id);
  }
  closeModal();
  await fetchProducts();
}

async function deleteProduct() {
  if (!selectedProduct.value) {
    alert('Tidak ada produk yang dipilih untuk dihapus!');
    return;
  }
  console.log('Menghapus produk id:', selectedProduct.value.id);
  const { error } = await supabase.from('products').delete().eq('id', selectedProduct.value.id);
  if (error) {
    alert('Gagal menghapus produk: ' + (error.message || ''));
    return;
  }
  alert('Produk berhasil dihapus!');
  closeModal();
  await fetchProducts();
}

async function saveProductStock() {
  if (!stockModalProduct.value || !selectedOutlet.value) return;
  const payload = {
    product_id: stockModalProduct.value.id,
    outlet_id: selectedOutlet.value,
    stock_quantity: stockForm.value.stock_quantity,
    price: stockForm.value.price,
    is_active: stockForm.value.is_active
  };
  const { error } = await supabase
    .from('product_outlets')
    .upsert([payload], { onConflict: ['product_id', 'outlet_id'] });
  if (error) {
    alert('Gagal menyimpan stok: ' + error.message);
    return;
  }
  showStockModal.value = false;
  await fetchProductStocksAndPrices();
}

async function addCategory() {
  if (!newCategoryName.value.trim()) {
    alert('Nama kategori wajib diisi');
    return;
  }
  const { data, error } = await supabase.from('categories').insert([
    { name: newCategoryName.value, business_id: businessId.value }
  ]).select();
  if (error || !data || !data[0]) {
    alert('Gagal menambah kategori: ' + (error?.message || ''));
    return;
  }
  await fetchCategories();
  form.value.category_id = data[0].id;
  showAddCategory.value = false;
  newCategoryName.value = '';
}

function confirmDeleteCategory(catId) {
  console.log('Confirm delete category:', catId);
  categoryToDelete.value = catId;
  showDeleteCategoryConfirm.value = true;
}

async function deleteCategory(catId) {
  // Cek apakah kategori dipakai produk lain
  const { data: usedProducts } = await supabase.from('products').select('id').eq('category_id', catId);
  if (usedProducts && usedProducts.length > 0) {
    alert('Kategori tidak bisa dihapus karena masih dipakai produk lain!');
    showDeleteCategoryConfirm.value = false;
    return;
  }
  const { error } = await supabase.from('categories').delete().eq('id', catId);
  if (error) {
    alert('Gagal menghapus kategori: ' + error.message);
  } else {
    alert('Kategori berhasil dihapus!');
    if (form.value.category_id === catId) form.value.category_id = '';
    await fetchCategories();
  }
  showDeleteCategoryConfirm.value = false;
}

function openAddModal() {
  modalMode.value = 'add';
  resetForm();
  photoFile.value = null;
  photoPreview.value = '';
  showModal.value = true;
}

function openEditModal(prod) {
  modalMode.value = 'edit';
  selectedProduct.value = prod;
  form.value = { ...prod };
  photoFile.value = null;
  photoPreview.value = '';
  // Fetch varian dari Supabase
  fetchProductVariants(prod.id);
  showModal.value = true;
}

function openDeleteModal(prod) {
  modalMode.value = 'delete';
  selectedProduct.value = prod;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedProduct.value = null;
  photoFile.value = null;
  photoPreview.value = '';
}

function closeStockModal() {
  showStockModal.value = false;
  variantStockError.value = '';
  variantStockLoading.value = false;
  variantStocks.value = [];
}

function onPhotoChange(event) {
  const file = event.target.files[0];
  if (file) {
    photoFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      photoPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function removePhoto() {
  photoFile.value = null;
  photoPreview.value = '';
}

async function uploadPhotoIfNeeded(productId) {
  if (!photoFile.value) return '';
  const fileExt = photoFile.value.name.split('.').pop();
  const fileName = `products/${productId}.${fileExt}`;
  const { error: uploadError } = await supabase.storage.from('product-photos').upload(fileName, photoFile.value, { upsert: true });
  if (uploadError) {
    alert('Gagal mengupload foto: ' + uploadError.message);
    return '';
  }
  const { data, error: urlError } = supabase.storage.from('product-photos').getPublicUrl(fileName);
  const publicURL = data?.publicUrl;
  console.log('Upload file:', fileName, 'publicURL:', publicURL, 'urlError:', urlError);
  if (urlError) {
    alert('Gagal mendapatkan URL foto: ' + urlError.message);
    return '';
  }
  if (!publicURL) {
    alert('URL foto kosong, cek pengaturan bucket public.');
    return '';
  }
  return publicURL;
}

function openStockModal(prod) {
  stockModalProduct.value = prod;
  // Ambil data stok, harga, dan status aktif dari product_outlets jika ada
  supabase.from('product_outlets')
    .select('stock_quantity,price,is_active')
    .eq('product_id', prod.id)
    .eq('outlet_id', selectedOutlet.value)
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) {
        stockForm.value = {
          product_id: prod.id,
          stock_quantity: 0,
          price: 0,
          is_active: true
        };
      } else if (data) {
        stockForm.value = {
          product_id: prod.id,
          stock_quantity: data.stock_quantity ?? 0,
          price: data.price ?? 0,
          is_active: data.is_active ?? true
        };
      } else {
        stockForm.value = {
          product_id: prod.id,
          stock_quantity: 0,
          price: 0,
          is_active: true
        };
      }
      // Fetch variant stocks
      fetchVariantStocks(prod.id, selectedOutlet.value);
      showStockModal.value = true;
    });
}

function addVarian() {
  if (!varianForm.value.name) {
    alert('Nama varian wajib diisi');
    return;
  }
  if (editingVarianIndex.value !== null) {
    formVarian.value[editingVarianIndex.value] = { ...varianForm.value };
  } else {
    formVarian.value.push({ ...varianForm.value });
  }
  resetVarianForm();
}
function editVarian(idx) {
  editingVarianIndex.value = idx;
  varianForm.value = { ...formVarian.value[idx] };
}
function deleteVarian(idx) {
  formVarian.value.splice(idx, 1);
  resetVarianForm();
}

function openViewVarianModal(prod) {
  viewVarianProduct.value = prod;
  showViewVarianModal.value = true;
  // Ambil semua varian produk
  supabase.from('product_variants')
    .select('*')
    .eq('product_id', prod.id)
    .then(async ({ data: variants, error }) => {
      if (error || !variants) {
        viewVarianList.value = [];
        return;
      }
      // Ambil data stok/harga varian per outlet
      const { data: stocks } = await supabase.from('product_variant_outlets')
        .select('variant_id, stock_quantity, price, is_active')
        .eq('outlet_id', selectedOutlet.value);
      // Gabungkan data varian dengan data outlet
      viewVarianList.value = variants.map(v => {
        const found = stocks?.find(s => s.variant_id === v.id);
        return {
          id: v.id,
          name: v.name,
          sku: v.sku,
          price: found?.price ?? v.price,
          stock_quantity: found?.stock_quantity ?? 0,
          is_active: found?.is_active ?? true
        };
      });
    });
}

onMounted(() => {
  fetchOutlets();
  fetchCategories();
  fetchProducts();
  fetchProductStocksAndPrices();
});

watch(selectedOutlet, () => {
  fetchProductStocksAndPrices();
});
</script>

<style>
/* Tambahkan style khusus jika diperlukan */
</style>
