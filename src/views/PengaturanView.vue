<template>
  <div class="p-4 md:p-6 bg-gray-50 min-h-full">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-800">Pengaturan</h1>
      <p class="text-gray-600 mb-6">Kelola informasi usaha, outlet, dan pegawai Anda di sini.</p>

      <!-- Navigasi Tab Modern -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <!-- LOGIKA @click TIDAK DIUBAH, HANYA GAYA CSS -->
          <a 
            href="#" 
            @click.prevent="activeTab = 'usaha'" 
            :class="[activeTab === 'usaha' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']"
          >
            Info Usaha
          </a>
          <a 
            href="#" 
            @click.prevent="activeTab = 'outlet'" 
            :class="[activeTab === 'outlet' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']"
          >
            Outlet
          </a>
          <a 
            href="#" 
            @click.prevent="activeTab = 'pegawai'" 
            :class="[activeTab === 'pegawai' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']"
          >
            Pegawai
          </a>
        </nav>
      </div>

      <!-- Area Konten Tab -->
      <div class="mt-6">
        <!-- LOGIKA v-if TIDAK DIUBAH -->
        <div v-if="activeTab === 'usaha'">
          <BusinessInfoPanel />
        </div>
        <div v-if="activeTab === 'outlet'">
          <OutletsPanel />
        </div>
        <div v-if="activeTab === 'pegawai'">
          <EmployeesPanel />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
// SCRIPT TIDAK DIUBAH SAMA SEKALI
import { ref } from 'vue';
import BusinessInfoPanel from '@/components/settings/BusinessInfoPanel.vue';
import OutletsPanel from '@/components/settings/OutletsPanel.vue';
import EmployeesPanel from '@/components/settings/EmployeesPanel.vue';

const activeTab = ref('usaha');
</script>
