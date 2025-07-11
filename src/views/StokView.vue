<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Manajemen Stok Bahan Baku & Produk</h1>
    <div class="tabs tabs-boxed mb-4">
      <button class="tab tab-active" @click="activeTab = 'bahan'">Bahan Baku</button>
      <button class="tab" @click="activeTab = 'stok'">Stok per Outlet</button>
      <button class="tab" @click="activeTab = 'mutasi'">Mutasi Stok</button>
      <button class="tab" @click="activeTab = 'produk'">Stok Produk Jadi</button>
    </div>

    <!-- Tab Bahan Baku -->
    <div v-if="activeTab === 'bahan'">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-semibold">Daftar Bahan Baku</h2>
        <button class="btn btn-primary" @click="showAddIngredient = true">Tambah Bahan Baku</button>
      </div>
      <table class="table w-full">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Satuan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in ingredients" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.unit }}</td>
            <td>
              <button class="btn btn-xs btn-info mr-2" @click="editIngredient(item)">Edit</button>
              <button class="btn btn-xs btn-error" @click="deleteIngredient(item.id)">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Modal Tambah/Edit Bahan Baku -->
      <dialog v-if="showAddIngredient" class="modal modal-open">
        <form class="modal-box" @submit.prevent="saveIngredient">
          <h3 class="font-bold text-lg mb-2">{{ editMode ? 'Edit' : 'Tambah' }} Bahan Baku</h3>
          <div class="mb-2">
            <label class="block mb-1">Nama</label>
            <input v-model="ingredientForm.name" class="input input-bordered w-full" required />
          </div>
          <div class="mb-2">
            <label class="block mb-1">Satuan</label>
            <input v-model="ingredientForm.unit" class="input input-bordered w-full" required />
          </div>
          <div class="modal-action">
            <button type="button" class="btn" @click="closeIngredientModal">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan</button>
          </div>
        </form>
      </dialog>
    </div>

    <!-- Tab Stok per Outlet -->
    <div v-if="activeTab === 'stok'">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-semibold">Stok Bahan Baku per Outlet</h2>
        <select v-model="selectedOutlet" class="select select-bordered w-48">
          <option v-for="outlet in outlets" :key="outlet.id" :value="outlet.id">{{ outlet.name }}</option>
        </select>
        <button class="btn btn-primary" @click="showAddStock = true">Tambah/Update Stok</button>
      </div>
      <table class="table w-full">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Satuan</th>
            <th>Stok</th>
            <th>Min Stok</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stock in ingredientStocks" :key="stock.id">
            <td>{{ stock.ingredient_name }}</td>
            <td>{{ stock.unit }}</td>
            <td :class="{'text-error': stock.stock_quantity < stock.min_stock}">{{ stock.stock_quantity }}</td>
            <td>{{ stock.min_stock }}</td>
            <td>{{ stock.is_active ? 'Aktif' : 'Nonaktif' }}</td>
            <td>
              <button class="btn btn-xs btn-info" @click="editStock(stock)">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Modal Tambah/Edit Stok -->
      <dialog v-if="showAddStock" class="modal modal-open">
        <form class="modal-box" @submit.prevent="saveStock">
          <h3 class="font-bold text-lg mb-2">Update Stok Bahan Baku</h3>
          <div class="mb-2">
            <label class="block mb-1">Bahan Baku</label>
            <select v-model="stockForm.ingredient_id" class="select select-bordered w-full" required>
              <option v-for="item in ingredients" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </div>
          <div class="mb-2">
            <label class="block mb-1">Jumlah Stok</label>
            <input type="number" v-model.number="stockForm.stock_quantity" class="input input-bordered w-full" required />
          </div>
          <div class="mb-2">
            <label class="block mb-1">Min Stok</label>
            <input type="number" v-model.number="stockForm.min_stock" class="input input-bordered w-full" />
          </div>
          <div class="mb-2">
            <label class="block mb-1">Status</label>
            <select v-model="stockForm.is_active" class="select select-bordered w-full">
              <option :value="true">Aktif</option>
              <option :value="false">Nonaktif</option>
            </select>
          </div>
          <div class="modal-action">
            <button type="button" class="btn" @click="closeStockModal">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan</button>
          </div>
        </form>
      </dialog>
    </div>

    <!-- Tab Mutasi Stok -->
    <div v-if="activeTab === 'mutasi'">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-semibold">Riwayat Mutasi Stok Bahan Baku</h2>
        <button class="btn btn-primary" @click="showAddMutation = true">Input Mutasi Stok</button>
      </div>
      <table class="table w-full">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Bahan Baku</th>
            <th>Outlet</th>
            <th>Jenis Mutasi</th>
            <th>Jumlah</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mutation in stockMutations" :key="mutation.id">
            <td>{{ mutation.created_at }}</td>
            <td>{{ mutation.ingredient_name }}</td>
            <td>{{ mutation.outlet_name }}</td>
            <td>{{ mutation.movement_type }}</td>
            <td>{{ mutation.quantity }}</td>
            <td>{{ mutation.ref }}</td>
          </tr>
        </tbody>
      </table>
      <!-- Modal Input Mutasi Stok -->
      <dialog v-if="showAddMutation" class="modal modal-open">
        <form class="modal-box" @submit.prevent="saveMutation">
          <h3 class="font-bold text-lg mb-2">Input Mutasi Stok</h3>
          <div class="mb-2">
            <label class="block mb-1">Bahan Baku</label>
            <select v-model="mutationForm.ingredient_id" class="select select-bordered w-full" required>
              <option v-for="item in ingredients" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </div>
          <div class="mb-2">
            <label class="block mb-1">Outlet Asal</label>
            <select v-model="mutationForm.outlet_id" class="select select-bordered w-full" required>
              <option v-for="outlet in outlets" :key="outlet.id" :value="outlet.id">{{ outlet.name }}</option>
            </select>
          </div>
          <div class="mb-2" v-if="mutationForm.movement_type === 'transfer'">
            <label class="block mb-1">Outlet Tujuan</label>
            <select v-model="mutationForm.outlet_id_tujuan" class="select select-bordered w-full" required>
              <option v-for="outlet in outlets" :key="outlet.id" :value="outlet.id" v-if="outlet.id !== mutationForm.outlet_id">{{ outlet.name }}</option>
            </select>
          </div>
          <div class="mb-2">
            <label class="block mb-1">Jenis Mutasi</label>
            <select v-model="mutationForm.movement_type" class="select select-bordered w-full" required>
              <option value="masuk">Masuk</option>
              <option value="keluar">Keluar</option>
              <option value="penyesuaian">Penyesuaian</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          <div class="mb-2">
            <label class="block mb-1">Jumlah</label>
            <input type="number" v-model.number="mutationForm.quantity" class="input input-bordered w-full" required />
          </div>
          <div class="mb-2">
            <label class="block mb-1">Keterangan</label>
            <input v-model="mutationForm.ref" class="input input-bordered w-full" />
          </div>
          <div class="modal-action">
            <button type="button" class="btn" @click="closeMutationModal">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan</button>
          </div>
        </form>
      </dialog>
    </div>

    <!-- Tab Monitoring Stok Produk Jadi -->
    <div v-if="activeTab === 'produk'">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-semibold">Monitoring Stok Produk Jadi</h2>
      </div>
      <table class="table w-full">
        <thead>
          <tr>
            <th>Nama Produk</th>
            <th>Varian</th>
            <th>Outlet</th>
            <th>Stok</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in productStocks" :key="product.id">
            <td>{{ product.product_name }}</td>
            <td>{{ product.variant_name || '-' }}</td>
            <td>{{ product.outlet_name }}</td>
            <td :class="{'text-error': product.stock_quantity < product.min_stock}">{{ product.stock_quantity }}</td>
            <td>{{ product.is_active ? 'Aktif' : 'Nonaktif' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '../supabase'
// Contoh: business_id dari Pinia store atau Supabase Auth
import { useUserStore } from '../stores/userStore'
const userStore = useUserStore()
const business_id = ref('')

const activeTab = ref('bahan')
const showAddIngredient = ref(false)
const showAddStock = ref(false)
const showAddMutation = ref(false)
const editMode = ref(false)
const ingredients = ref([])
const ingredientForm = ref({ name: '', unit: '' })
const outlets = ref([])
const selectedOutlet = ref('')
const ingredientStocks = ref([])
const stockForm = ref({ ingredient_id: '', stock_quantity: 0, min_stock: 0, is_active: true })
const stockMutations = ref([])
const mutationForm = ref({ ingredient_id: '', outlet_id: '', outlet_id_tujuan: '', movement_type: '', quantity: 0, ref: '' })
const productStocks = ref([])
const notification = ref('')


onMounted(async () => {
  // Ambil business_id dari profil userStore (multi-tenant, sesuai skema)
  if (userStore.profile && userStore.profile.business_id) {
    business_id.value = userStore.profile.business_id
  } else {
    // Fallback: ambil dari Supabase Auth (pastikan userStore.user.id valid)
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_id')
      .eq('id', userStore.user?.id)
      .single()
    business_id.value = profile?.business_id || ''
  }
  // Validasi: jika business_id tidak ditemukan, jangan fetch data
  if (!business_id.value) {
    notification.value = 'Business ID tidak ditemukan. Data tidak akan ditampilkan.'
    return
  }
  await fetchIngredients()
  await fetchOutlets()
  if (selectedOutlet.value) await fetchIngredientStocks()
  await fetchStockMutations()
  await fetchProductStocks()
})

async function fetchIngredients() {
  if (!business_id.value) return
  const { data, error } = await supabase.from('ingredients').select('*').eq('business_id', business_id.value)
  if (error) notification.value = 'Gagal mengambil data bahan baku.'
  else ingredients.value = data || []
}

async function fetchOutlets() {
  if (!business_id.value) return
  const { data, error } = await supabase.from('outlets').select('*').eq('business_id', business_id.value)
  if (error) notification.value = 'Gagal mengambil data outlet.'
  else outlets.value = data || []
  if (data && data.length > 0 && !selectedOutlet.value) selectedOutlet.value = data[0].id
}

async function fetchIngredientStocks() {
  if (!selectedOutlet.value || !business_id.value) return
  const { data, error } = await supabase
    .from('ingredient_outlets')
    .select('*, ingredients(name, unit, business_id)')
    .eq('outlet_id', selectedOutlet.value)
    .eq('ingredients.business_id', business_id.value)
  if (error) notification.value = 'Gagal mengambil data stok bahan baku.'
  else ingredientStocks.value = (data || []).map(item => ({
    ...item,
    ingredient_name: item.ingredients?.name,
    unit: item.ingredients?.unit
  }))
}

async function fetchStockMutations() {
  if (!business_id.value) return
  // Filter mutasi hanya milik bisnis aktif
  const { data, error } = await supabase
    .from('ingredient_stock_movements')
    .select('*, outlets(id, name, business_id), ingredients(id, name, business_id)')
    .eq('outlets.business_id', business_id.value)
    .eq('ingredients.business_id', business_id.value)
    .order('created_at', { ascending: false })
  if (error) notification.value = 'Gagal mengambil data mutasi stok.'
  else stockMutations.value = (data || []).filter(item =>
    item.outlets?.business_id === business_id.value && item.ingredients?.business_id === business_id.value
  ).map(item => ({
    ...item,
    ingredient_name: item.ingredients?.name,
    outlet_name: item.outlets?.name
  }))
}

async function fetchProductStocks() {
  if (!business_id.value) return
  // Produk tanpa varian
  const { data: prodData, error: prodError } = await supabase
    .from('product_outlets')
    .select('*, products(id, name, business_id), outlets(id, name, business_id)')
    .eq('products.business_id', business_id.value)
    .eq('outlets.business_id', business_id.value)
  // Produk dengan varian
  const { data: varData, error: varError } = await supabase
    .from('product_variant_outlets')
    .select('*, product_variants(id, name, product_id, products(id, name, business_id)), outlets(id, name, business_id)')
    .eq('product_variants.products.business_id', business_id.value)
    .eq('outlets.business_id', business_id.value)
  if (prodError || varError) notification.value = 'Gagal mengambil data stok produk.'
  else {
    productStocks.value = []
    if (prodData) prodData.filter(item =>
      item.products?.business_id === business_id.value && item.outlets?.business_id === business_id.value
    ).forEach(item => {
      productStocks.value.push({
        id: item.id,
        product_name: item.products?.name,
        variant_name: null,
        outlet_name: item.outlets?.name,
        stock_quantity: item.stock_quantity,
        min_stock: 0,
        is_active: item.is_active
      })
    })
    if (varData) varData.filter(item =>
      item.product_variants?.products?.business_id === business_id.value && item.outlets?.business_id === business_id.value
    ).forEach(item => {
      productStocks.value.push({
        id: item.id,
        product_name: item.product_variants?.products?.name,
        variant_name: item.product_variants?.name,
        outlet_name: item.outlets?.name,
        stock_quantity: item.stock_quantity,
        min_stock: 0,
        is_active: item.is_active
      })
    })
  }
}

// CRUD Bahan Baku
async function saveIngredient() {
  if (!ingredientForm.value.name || !ingredientForm.value.unit) {
    notification.value = 'Nama dan satuan wajib diisi.'
    return;
  }
  if (editMode.value && ingredientForm.value.id) {
    const { error } = await supabase
      .from('ingredients')
      .update({ name: ingredientForm.value.name, unit: ingredientForm.value.unit })
      .eq('id', ingredientForm.value.id)
      .eq('business_id', business_id.value)
    if (error) notification.value = 'Gagal update bahan baku.'
    else notification.value = 'Bahan baku berhasil diupdate.'
  } else {
    const { error } = await supabase
      .from('ingredients')
      .insert([{ name: ingredientForm.value.name, unit: ingredientForm.value.unit, business_id: business_id.value }])
    if (error) notification.value = 'Gagal tambah bahan baku.'
    else notification.value = 'Bahan baku berhasil ditambah.'
  }
  await fetchIngredients()
  closeIngredientModal()
}

async function deleteIngredient(id) {
  const { error } = await supabase.from('ingredients').delete().eq('id', id).eq('business_id', business_id.value)
  if (error) notification.value = 'Gagal hapus bahan baku.'
  else notification.value = 'Bahan baku berhasil dihapus.'
  await fetchIngredients()
}

// CRUD Stok Bahan Baku
async function saveStock() {
  if (!stockForm.value.ingredient_id || !selectedOutlet.value) {
    notification.value = 'Bahan baku dan outlet wajib dipilih.'
    return
  }
  // Cek apakah stok sudah ada
  const { data, error } = await supabase
    .from('ingredient_outlets')
    .select('id')
    .eq('ingredient_id', stockForm.value.ingredient_id)
    .eq('outlet_id', selectedOutlet.value)
    .maybeSingle() // ganti dari .single() ke .maybeSingle()
  if (data && data.id) {
    // Update
    const { error } = await supabase
      .from('ingredient_outlets')
      .update({
        stock_quantity: stockForm.value.stock_quantity,
        min_stock: stockForm.value.min_stock,
        is_active: stockForm.value.is_active
      })
      .eq('id', data.id)
    if (error) notification.value = 'Gagal update stok.'
    else notification.value = 'Stok berhasil diupdate.'
  } else {
    // Insert
    const { error } = await supabase
      .from('ingredient_outlets')
      .insert([{ ingredient_id: stockForm.value.ingredient_id, outlet_id: selectedOutlet.value, stock_quantity: stockForm.value.stock_quantity, min_stock: stockForm.value.min_stock, is_active: stockForm.value.is_active }])
    if (error) notification.value = 'Gagal tambah stok.'
    else notification.value = 'Stok berhasil ditambah.'
  }
  await fetchIngredientStocks()
  closeStockModal()
}

// CRUD Mutasi Stok
async function saveMutation() {
  if (!mutationForm.value.ingredient_id || !mutationForm.value.outlet_id || !mutationForm.value.movement_type || !mutationForm.value.quantity || (mutationForm.value.movement_type === 'transfer' && !mutationForm.value.outlet_id_tujuan)) {
    notification.value = 'Semua field wajib diisi.'
    return
  }
  if (mutationForm.value.movement_type === 'transfer') {
    // Transfer: kurangi stok outlet asal, tambah stok outlet tujuan
    // 1. Insert mutasi keluar di outlet asal
    const { error: errorKeluar } = await supabase
      .from('ingredient_stock_movements')
      .insert([{ ingredient_id: mutationForm.value.ingredient_id, outlet_id: mutationForm.value.outlet_id, movement_type: 'keluar', quantity: mutationForm.value.quantity, ref: mutationForm.value.ref + ' (Transfer ke outlet tujuan)' }])
    // 2. Insert mutasi masuk di outlet tujuan
    const { error: errorMasuk } = await supabase
      .from('ingredient_stock_movements')
      .insert([{ ingredient_id: mutationForm.value.ingredient_id, outlet_id: mutationForm.value.outlet_id_tujuan, movement_type: 'masuk', quantity: mutationForm.value.quantity, ref: mutationForm.value.ref + ' (Transfer dari outlet asal)' }])
    // 3. Update stok outlet asal
    const { data: stockAsal } = await supabase
      .from('ingredient_outlets')
      .select('id, stock_quantity')
      .eq('ingredient_id', mutationForm.value.ingredient_id)
      .eq('outlet_id', mutationForm.value.outlet_id)
      .single()
    let newStockAsal = stockAsal?.stock_quantity || 0
    newStockAsal -= mutationForm.value.quantity
    if (newStockAsal < 0) newStockAsal = 0
    await supabase
      .from('ingredient_outlets')
      .update({ stock_quantity: newStockAsal })
      .eq('id', stockAsal?.id)
    // 4. Update stok outlet tujuan
    const { data: stockTujuan } = await supabase
      .from('ingredient_outlets')
      .select('id, stock_quantity')
      .eq('ingredient_id', mutationForm.value.ingredient_id)
      .eq('outlet_id', mutationForm.value.outlet_id_tujuan)
      .single()
    let newStockTujuan = stockTujuan?.stock_quantity || 0
    newStockTujuan += mutationForm.value.quantity
    await supabase
      .from('ingredient_outlets')
      .update({ stock_quantity: newStockTujuan })
      .eq('id', stockTujuan?.id)
    notification.value = 'Transfer stok berhasil.'
    await fetchIngredientStocks()
    await fetchStockMutations()
    closeMutationModal()
    return
  }
  // Mutasi selain transfer, jangan kirim outlet_id_tujuan
  const { ingredient_id, outlet_id, movement_type, quantity, ref } = mutationForm.value
  const { error } = await supabase
    .from('ingredient_stock_movements')
    .insert([{ ingredient_id, outlet_id, movement_type, quantity, ref }])
  if (error) {
    notification.value = 'Gagal input mutasi stok.'
    return
  }
  // Update stok bahan baku sesuai jenis mutasi
  // Ambil stok saat ini
  const { data: stockData, error: stockError } = await supabase
    .from('ingredient_outlets')
    .select('id, stock_quantity')
    .eq('ingredient_id', mutationForm.value.ingredient_id)
    .eq('outlet_id', mutationForm.value.outlet_id)
    .single()
  if (stockError || !stockData) {
    notification.value = 'Mutasi berhasil, tapi gagal update stok.'
    await fetchStockMutations()
    closeMutationModal()
    return
  }
  let newStock = stockData.stock_quantity
  if (mutationForm.value.movement_type === 'masuk') {
    newStock += mutationForm.value.quantity
  } else if (mutationForm.value.movement_type === 'keluar') {
    newStock -= mutationForm.value.quantity
    if (newStock < 0) newStock = 0
  } else if (mutationForm.value.movement_type === 'penyesuaian') {
    newStock = mutationForm.value.quantity
  }
  // Untuk transfer, perlu field outlet tujuan (belum diimplementasi)
  // Update stok
  const { error: updateError } = await supabase
    .from('ingredient_outlets')
    .update({ stock_quantity: newStock })
    .eq('id', stockData.id)
  if (updateError) notification.value = 'Mutasi berhasil, tapi gagal update stok.'
  else notification.value = 'Mutasi stok berhasil disimpan dan stok diupdate.'
  await fetchIngredientStocks()
  await fetchStockMutations()
  closeMutationModal()
}

// Watcher outlet untuk update stok
watch(selectedOutlet, async () => {
  await fetchIngredientStocks()
})

function closeIngredientModal() {
  showAddIngredient.value = false
  editMode.value = false
  ingredientForm.value = { name: '', unit: '' }
}
function editIngredient(item) {
  editMode.value = true
  showAddIngredient.value = true
  ingredientForm.value = { ...item }
}
function closeStockModal() {
  showAddStock.value = false
  stockForm.value = { ingredient_id: '', stock_quantity: 0, min_stock: 0, is_active: true }
}
function editStock(stock) {
  showAddStock.value = true
  // Pastikan outlet_id diisi saat edit stok
  stockForm.value = {
    ingredient_id: stock.ingredient_id,
    stock_quantity: stock.stock_quantity,
    min_stock: stock.min_stock,
    is_active: stock.is_active
  }
}
function closeMutationModal() {
  showAddMutation.value = false
  mutationForm.value = { ingredient_id: '', outlet_id: '', outlet_id_tujuan: '', movement_type: '', quantity: 0, ref: '' }
}
</script>

<style scoped>
/* Tambahkan style custom jika diperlukan */
</style>
