<script setup>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Daftarkan semua komponen Chart.js yang kita butuhkan
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Komponen ini menerima 2 props: data untuk chart dan opsi styling
defineProps({
  chartData: {
    type: Object,
    required: true
  },
  chartOptions: {
    type: Object,
    default: () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // Sembunyikan legenda atas
        },
      },
      scales: {
        y: {
          beginAtZero: true, // Mulai sumbu Y dari 0
        },
      },
    })
  }
})
</script>

<template>
  <Line :data="chartData" :options="chartOptions" />
</template>