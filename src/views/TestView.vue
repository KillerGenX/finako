<template>
  <div style="padding: 20px; font-family: Arial, sans-serif;">
    <h1>Test Page</h1>
    <p>Jika halaman ini muncul, berarti tidak ada masalah di routing dan Vue.js.</p>
    <button @click="testClick" style="padding: 10px; background: blue; color: white; border: none; cursor: pointer;">Test Button</button>
    <p v-if="clicked">Button berhasil diklik!</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const clicked = ref(false)

function testClick() {
  clicked.value = true
}
</script>