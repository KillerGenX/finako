// File: src/supabase.js
// Tugas file ini adalah membaca kunci rahasia dari .env dan membuat koneksi ke Supabase.

import { createClient } from '@supabase/supabase-js'

// Kode ini akan mengambil URL dan Key dari file .env yang sudah Anda buat sebelumnya.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Membuat dan mengekspor "client" Supabase.
// "Client" inilah yang akan kita gunakan di file lain (seperti App.vue) untuk berinteraksi dengan database.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)