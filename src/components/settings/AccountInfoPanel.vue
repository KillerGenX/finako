<template>
  <div class="bg-white rounded-xl shadow-lg border border-gray-100">
    <div class="p-6 border-b border-gray-100">
      <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
        <div class="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        Informasi Akun
      </h2>
      <p class="text-gray-600 text-sm mt-1">Kelola profil dan keamanan akun Anda</p>
    </div>

    <div class="p-6 space-y-6">
      <!-- Profile Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Avatar & Basic Info -->
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {{ (userStore.user?.user_metadata?.full_name || userStore.userFullName || 'U').charAt(0).toUpperCase() }}
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">{{ userStore.user?.user_metadata?.full_name || userStore.userFullName || 'User' }}</h3>
              <p class="text-sm text-gray-500">{{ userStore.user?.email }}</p>
              <span class="inline-block px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full mt-1">
                {{ userStore.activeRole?.name || 'User' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-gray-800">{{ userStore.business?.name ? '1' : '0' }}</div>
            <div class="text-sm text-gray-600">Bisnis</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-gray-800">{{ userStore.accessibleOutlets?.length || '0' }}</div>
            <div class="text-sm text-gray-600">Outlet</div>
          </div>
        </div>
      </div>

      <!-- Edit Profile Form -->
      <div class="border-t pt-6">
        <h4 class="font-semibold text-gray-800 mb-4">Edit Profil</h4>
        <form @submit.prevent="updateProfile" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
              <input 
                v-model="profileForm.full_name"
                type="text" 
                class="input input-bordered w-full"
                placeholder="Masukkan nama lengkap"
                :disabled="isUpdatingProfile"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                v-model="profileForm.email"
                type="email" 
                class="input input-bordered w-full"
                placeholder="Masukkan email"
                :disabled="isUpdatingProfile"
              />
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3 justify-end">
            <button 
              type="button"
              @click="resetProfileForm"
              class="btn btn-ghost order-2 sm:order-1"
              :disabled="isUpdatingProfile"
            >
              Reset
            </button>
            <button 
              type="submit"
              class="btn bg-teal-600 hover:bg-teal-700 text-white border-none order-1 sm:order-2"
              :disabled="isUpdatingProfile"
            >
              <span v-if="isUpdatingProfile" class="loading loading-spinner loading-sm mr-2"></span>
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>

      <!-- Change Password Section -->
      <div class="border-t pt-6">
        <h4 class="font-semibold text-gray-800 mb-4">Ubah Password</h4>
        <form @submit.prevent="changePassword" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Password Lama</label>
              <input 
                v-model="passwordForm.current_password"
                type="password" 
                class="input input-bordered w-full"
                placeholder="Masukkan password lama"
                :disabled="isUpdatingPassword"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
              <input 
                v-model="passwordForm.new_password"
                type="password" 
                class="input input-bordered w-full"
                placeholder="Masukkan password baru"
                :disabled="isUpdatingPassword"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
              <input 
                v-model="passwordForm.confirm_password"
                type="password" 
                class="input input-bordered w-full"
                placeholder="Konfirmasi password baru"
                :disabled="isUpdatingPassword"
              />
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3 justify-end">
            <button 
              type="button"
              @click="resetPasswordForm"
              class="btn btn-ghost order-2 sm:order-1"
              :disabled="isUpdatingPassword"
            >
              Reset
            </button>
            <button 
              type="submit"
              class="btn bg-red-600 hover:bg-red-700 text-white border-none order-1 sm:order-2"
              :disabled="isUpdatingPassword"
            >
              <span v-if="isUpdatingPassword" class="loading loading-spinner loading-sm mr-2"></span>
              Ubah Password
            </button>
          </div>
        </form>
      </div>

      <!-- Account Actions -->
      <div class="border-t pt-6">
        <h4 class="font-semibold text-gray-800 mb-4">Aksi Akun</h4>
        <div class="flex flex-col sm:flex-row gap-3">
          <button 
            @click="logout"
            class="btn btn-outline btn-error"
            :disabled="isLoggingOut"
          >
            <span v-if="isLoggingOut" class="loading loading-spinner loading-sm mr-2"></span>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useUserStoreRefactored } from '@/stores/userStoreRefactored';
import { supabase } from '@/supabase';

const userStore = useUserStoreRefactored();

const isUpdatingProfile = ref(false);
const isUpdatingPassword = ref(false);
const isLoggingOut = ref(false);

const profileForm = reactive({
  full_name: '',
  email: ''
});

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
});

onMounted(() => {
  resetProfileForm();
});

const resetProfileForm = () => {
  profileForm.full_name = userStore.user?.user_metadata?.full_name || userStore.userFullName || '';
  profileForm.email = userStore.user?.email || '';
};

const resetPasswordForm = () => {
  passwordForm.current_password = '';
  passwordForm.new_password = '';
  passwordForm.confirm_password = '';
};

const updateProfile = async () => {
  if (!profileForm.full_name.trim()) {
    alert('Nama lengkap tidak boleh kosong');
    return;
  }

  if (!profileForm.email.trim()) {
    alert('Email tidak boleh kosong');
    return;
  }

  isUpdatingProfile.value = true;
  
  try {
    // Update user metadata untuk full_name
    const { error: metadataError } = await supabase.auth.updateUser({
      email: profileForm.email,
      data: {
        ...userStore.user.user_metadata,
        full_name: profileForm.full_name
      }
    });

    if (metadataError) throw metadataError;

    // Refresh user session
    await userStore.fetchUserSession();
    
    alert('Profil berhasil diperbarui!');
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Gagal memperbarui profil: ' + error.message);
  } finally {
    isUpdatingProfile.value = false;
  }
};

const changePassword = async () => {
  if (!passwordForm.current_password) {
    alert('Password lama tidak boleh kosong');
    return;
  }

  if (!passwordForm.new_password || passwordForm.new_password.length < 6) {
    alert('Password baru minimal 6 karakter');
    return;
  }

  if (passwordForm.new_password !== passwordForm.confirm_password) {
    alert('Konfirmasi password tidak cocok');
    return;
  }

  isUpdatingPassword.value = true;
  
  try {
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.new_password
    });

    if (error) throw error;

    alert('Password berhasil diubah!');
    resetPasswordForm();
  } catch (error) {
    console.error('Error changing password:', error);
    alert('Gagal mengubah password: ' + error.message);
  } finally {
    isUpdatingPassword.value = false;
  }
};

const logout = async () => {
  if (!confirm('Apakah Anda yakin ingin logout?')) return;
  
  isLoggingOut.value = true;
  await userStore.logout();
  isLoggingOut.value = false;
};
</script>
