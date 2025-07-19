<template>
  <div class="p-4 md:p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-2">Pengaturan</h1>
      <p class="text-base-content/70 mb-6">Kelola informasi usaha, outlet, dan pegawai Anda di sini.</p>

      <!-- STRUKTUR TAB DAISYUI -->
      <div role="tablist" class="tabs tabs-lifted tabs-lg">
        
        <!-- Tab 1: Info Usaha -->
        <input 
          type="radio" 
          name="settings_tabs" 
          role="tab" 
          class="tab" 
          aria-label="Info Usaha" 
          :checked="activeTab === 'usaha'"
          @change="activeTab = 'usaha'"
        />
        <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
          <BusinessInfoPanel v-if="activeTab === 'usaha'" />
        </div>

        <!-- Tab 2: Outlet -->
        <input 
          type="radio" 
          name="settings_tabs" 
          role="tab" 
          class="tab" 
          aria-label="Outlet"
          :checked="activeTab === 'outlet'"
          @change="activeTab = 'outlet'"
        />
        <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
          <OutletsPanel v-if="activeTab === 'outlet'" />
        </div>

            <!-- Tab 3: Pegawai (AKTIFKAN) -->
            <input 
          type="radio" 
          name="settings_tabs" 
          role="tab" 
          class="tab" 
          aria-label="Pegawai"
          :checked="activeTab === 'pegawai'"
          @change="activeTab = 'pegawai'"
          />
        <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
          <EmployeesPanel v-if="activeTab === 'pegawai'" />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BusinessInfoPanel from '@/components/settings/BusinessInfoPanel.vue';
import OutletsPanel from '@/components/settings/OutletsPanel.vue';
import EmployeesPanel from '@/components/settings/EmployeesPanel.vue';

// State untuk mengontrol tab mana yang aktif
const activeTab = ref('usaha'); // Default tab saat halaman dibuka
</script>