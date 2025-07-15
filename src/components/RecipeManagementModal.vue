<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
    <div class="bg-base-100 p-6 rounded-lg shadow-xl w-full max-w-2xl">
      <h3 class="text-xl font-bold mb-4">Kelola Resep Produk Komposit</h3>
      
      <!-- Form untuk menambah atau mengedit item resep -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2 items-end mb-4 p-4 bg-base-200 rounded-lg">
        <div class="form-control col-span-2 md:col-span-1">
          <label class="label-text">Bahan Baku</label>
          <select v-model="recipeForm.ingredient_id" class="select select-sm select-bordered w-full">
            <option disabled value="">Pilih bahan baku...</option>
            <option v-for="ing in ingredients" :key="ing.id" :value="ing.id">
                {{ ing.name }} ({{ ing.unit }})
            </option>
          </select>
        </div>
        <div class="form-control">
          <label class="label-text">Jumlah Dipakai</label>
          <input v-model.number="recipeForm.quantity_used" type="number" min="0" step="0.01" placeholder="Jumlah" class="input input-sm input-bordered w-full" />
        </div>
        <div class="form-control">
          <button @click="addOrUpdateRecipeItem" class="btn btn-sm btn-primary w-full">{{ editingIndex === null ? 'Tambah' : 'Update' }}</button>
          <button v-if="editingIndex !== null" @click="cancelEdit" class="btn btn-sm btn-ghost mt-1">Batal</button>
        </div>
      </div>

      <!-- Tabel daftar item resep yang sudah ada -->
      <div class="max-h-60 overflow-y-auto">
        <table class="table table-compact w-full">
          <thead>
            <tr>
              <th>Bahan Baku</th>
              <th>Jumlah Dipakai</th>
              <th>Satuan</th>
              <th class="w-24">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in localRecipes" :key="index">
              <td>{{ getIngredientName(item.ingredient_id) }}</td>
              <td>{{ item.quantity_used }}</td>
              <td>{{ getIngredientUnit(item.ingredient_id) }}</td>
              <td>
                <button @click="editRecipeItem(index)" class="btn btn-ghost btn-xs">Edit</button>
                <button @click="deleteRecipeItem(index)" class="btn btn-ghost btn-xs text-error">Hapus</button>
              </td>
            </tr>
            <tr v-if="localRecipes.length === 0">
              <td colspan="4" class="text-center text-gray-400 py-4">Belum ada bahan baku ditambahkan ke resep.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tombol Selesai -->
      <div class="flex justify-end mt-6">
        <button class="btn" @click="done">Selesai</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useProductStore } from '@/stores/productStore';

const props = defineProps({
  show: Boolean,
  recipes: Array, // Menerima daftar resep dari komponen induk
});

const emit = defineEmits(['close', 'update:recipes']);
const productStore = useProductStore();

// Kita akan mengambil daftar bahan baku dari store untuk dropdown
const ingredients = computed(() => {
    // Cukup kembalikan master data ingredients dari store.
    // Tidak perlu lagi pemrosesan rumit di sini.
    return productStore.ingredients;
});


// State lokal untuk modal ini
const localRecipes = ref([]);
const recipeForm = ref({ ingredient_id: '', quantity_used: 0 });
const editingIndex = ref(null);

watch(() => props.recipes, (newVal) => {
  localRecipes.value = JSON.parse(JSON.stringify(newVal || []));
}, { immediate: true, deep: true });

function getIngredientName(id) {
    return ingredients.value.find(i => i.id === id)?.name || 'Tidak Ditemukan';
}
function getIngredientUnit(id) {
    return ingredients.value.find(i => i.id === id)?.unit || '-';
}

function resetForm() {
  recipeForm.value = { ingredient_id: '', quantity_used: 0 };
  editingIndex.value = null;
}

function addOrUpdateRecipeItem() {
  if (!recipeForm.value.ingredient_id || recipeForm.value.quantity_used <= 0) {
    alert('Bahan baku dan jumlah wajib diisi.');
    return;
  }
  const payload = { 
    ingredient_id: recipeForm.value.ingredient_id,
    quantity_used: recipeForm.value.quantity_used
  };

  if (editingIndex.value !== null) {
    localRecipes.value[editingIndex.value] = payload;
  } else {
    localRecipes.value.push(payload);
  }
  resetForm();
}

function editRecipeItem(index) {
  editingIndex.value = index;
  recipeForm.value = { ...localRecipes.value[index] };
}

function cancelEdit() { resetForm(); }

function deleteRecipeItem(index) {
  if (confirm(`Yakin ingin menghapus item resep ini?`)) {
    localRecipes.value.splice(index, 1);
  }
}

function done() {
  emit('update:recipes', localRecipes.value);
  emit('close');
}
</script>