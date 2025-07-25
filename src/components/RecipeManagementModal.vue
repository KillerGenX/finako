<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
    <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
      <h3 class="text-xl font-bold text-gray-800">Kelola Resep Produk</h3>
      <p class="text-sm text-gray-500 mb-4">Atur bahan baku yang digunakan untuk membuat produk ini.</p>
      
      <!-- Form input dengan gaya baru -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end mb-4 p-4 bg-gray-50 rounded-lg border">
        <div class="form-control col-span-2 md:col-span-1">
          <label class="label-text text-xs font-medium">Bahan Baku</label>
          <select v-model="recipeForm.ingredient_id" class="select select-sm select-bordered w-full mt-1">
            <option disabled value="">Pilih bahan...</option>
            <option v-for="ing in ingredients" :key="ing.id" :value="ing.id">
                {{ ing.name }} ({{ ing.unit }})
            </option>
          </select>
        </div>
        <div class="form-control">
          <label class="label-text text-xs font-medium">Jumlah Dipakai</label>
          <input v-model.number="recipeForm.quantity_used" type="number" min="0" step="0.01" placeholder="Jumlah" class="input input-sm input-bordered w-full mt-1" />
        </div>
        <div class="form-control flex flex-col gap-1">
          <button @click="addOrUpdateRecipeItem" class="btn btn-sm bg-teal-600 hover:bg-teal-700 text-white border-none w-full">{{ editingIndex === null ? 'Tambah' : 'Update' }}</button>
          <button v-if="editingIndex !== null" @click="cancelEdit" class="btn btn-sm btn-ghost w-full">Batal</button>
        </div>
      </div>

      <!-- Daftar item resep dengan gaya kartu -->
      <div class="max-h-60 overflow-y-auto space-y-2 p-1">
        <div v-if="localRecipes.length === 0" class="text-center text-gray-400 py-8">
            <p>Belum ada bahan yang ditambahkan ke resep.</p>
        </div>
        <div v-for="(item, index) in localRecipes" :key="index" class="flex items-center justify-between p-3 rounded-lg border" :class="{'bg-yellow-50 border-yellow-300': editingIndex === index}">
            <div>
                <p class="font-semibold text-gray-800">{{ getIngredientName(item.ingredient_id) }}</p>
                <p class="text-xs text-gray-500">Jumlah: {{ item.quantity_used }} {{ getIngredientUnit(item.ingredient_id) }}</p>
            </div>
            <div class="flex items-center gap-2">
                <button @click="editRecipeItem(index)" class="btn btn-xs btn-ghost text-gray-500">Edit</button>
                <button @click="deleteRecipeItem(index)" class="btn btn-xs btn-ghost text-red-500">Hapus</button>
            </div>
        </div>
      </div>

      <!-- Tombol Selesai -->
      <div class="flex justify-end mt-6 pt-4 border-t">
        <button class="btn" @click="done">Selesai</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// SCRIPT TIDAK DIUBAH SAMA SEKALI
import { ref, watch, computed } from 'vue';
import { useProductStore } from '@/stores/productStore';

const props = defineProps({
  show: Boolean,
  recipes: Array,
});

const emit = defineEmits(['close', 'update:recipes']);
const productStore = useProductStore();

const ingredients = computed(() => productStore.ingredients);

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
