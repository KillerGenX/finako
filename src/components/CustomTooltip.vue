<script setup>
// Komponen ini menerima 3 properti: teks, dan posisi (top, left)
defineProps({
  text: String,
  position: Object, // Berisi { top: number, left: number }
  visible: Boolean
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="absolute px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm z-[9999]"
        :style="{ top: `${position.top}px`, left: `${position.left}px` }"
      >
        {{ text }}
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Style untuk animasi fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>