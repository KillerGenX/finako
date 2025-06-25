<script setup>
import { onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";
import { supabase } from "@/supabase";

const userStore = useUserStore();

onMounted(() => {
  userStore.fetchUserProfile();

  supabase.auth.onAuthStateChange((_, session) => {
    if (session) {
      userStore.fetchUserProfile();
    } else {
      userStore.clearUserProfile();
    }
  });
});
</script>

<template>
  <div v-if="!userStore.isReady" class="flex h-screen items-center justify-center">
    <span class="loading loading-spinner loading-lg"></span>
  </div>

  <router-view v-else />
</template>
