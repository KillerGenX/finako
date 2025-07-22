import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/supabase';
import { useUserStoreRefactored, useUIStore } from './userStoreRefactored';

export const useAttendanceStore = defineStore('attendance', () => {
  const userStore = useUserStoreRefactored();
  const uiStore = useUIStore();

  const loading = ref(false);
  const lastAttendance = ref(null);
  const dashboardData = ref(null);

  // Getter untuk menentukan status saat ini
  const currentStatus = computed(() => {
    if (!lastAttendance.value) {
        return 'CLOCKED_OUT';
    }

    const lastClockInDate = new Date(lastAttendance.value.clock_in).toDateString();
    const todayDate = new Date().toDateString();

    // Jika ada data absensi terakhir, DAN clock_out nya kosong, DAN tanggal clock_in adalah HARI INI
    if (lastAttendance.value && !lastAttendance.value.clock_out && lastClockInDate === todayDate) {
      return 'CLOCKED_IN';
    }

    // Untuk semua kasus lain (belum pernah absen, sudah clock out, atau lupa clock out kemarin),
    // statusnya dianggap CLOCKED_OUT.
    return 'CLOCKED_OUT';
  });

  // Cek status absensi terakhir dari pegawai yang login
  async function fetchMyLastStatus() {
    loading.value = true;
    lastAttendance.value = null; // Reset dulu untuk state yang bersih
    try {
      const { data, error } = await supabase
        .from('employee_attendances')
        .select('*')
        .eq('user_id', userStore.userId)
        .order('clock_in', { ascending: false })
        .limit(1); // <-- HAPUS .single()
  
      if (error) {
          throw error;
      }
      
      // Karena hasilnya sekarang adalah array, kita ambil elemen pertamanya
      // Jika tidak ada data, 'data' akan menjadi array kosong [], dan 'data[0]' akan menjadi undefined.
      // Ini aman dan tidak akan menyebabkan error.
      if (data && data.length > 0) {
        lastAttendance.value = data[0];
      } else {
        lastAttendance.value = null; // Eksplisit set ke null jika tidak ada riwayat
      }
  
    } catch (e) {
      uiStore.showNotification(`Gagal mengambil status absensi: ${e.message}`, 'error');
    } finally {
      loading.value = false;
    }
  }
  
  // Aksi untuk Clock In
  async function clockIn(location, photoFile) {
    if (!userStore.activeOutletId) {
      uiStore.showNotification('Pilih outlet aktif terlebih dahulu sebelum melakukan Clock In.', 'error');
      return;
    }
    loading.value = true;
    try {
        const filePath = `${userStore.userId}/${Date.now()}-${photoFile.name}`;
        const { error: uploadError } = await supabase.storage
            .from('attendance-proofs')
            .upload(filePath, photoFile);
        if (uploadError) throw new Error(`Gagal mengupload foto: ${uploadError.message}`);

        const { data, error: insertError } = await supabase
            .from('employee_attendances')
            .insert({
                user_id: userStore.userId,
                outlet_id: userStore.activeOutletId,
                clock_in_photo_path: filePath,
                clock_in_latitude: location ? location.coords.latitude : null,
                clock_in_longitude: location ? location.coords.longitude : null
            })
            .select()
            .single();
        if (insertError) throw insertError;
        
        lastAttendance.value = data;
        uiStore.showNotification('Clock In berhasil!', 'success');
    } catch (e) {
        uiStore.showNotification(e.message, 'error');
    } finally {
        loading.value = false;
    }
  }

  // Aksi untuk Clock Out
  async function clockOut(location, photoFile) {
    if (!lastAttendance.value || lastAttendance.value.clock_out) {
      uiStore.showNotification('Status tidak valid untuk Clock Out.', 'error');
      return;
    }
    loading.value = true;
    try {
        const filePath = `${userStore.userId}/${Date.now()}-${photoFile.name}`;
        const { error: uploadError } = await supabase.storage
            .from('attendance-proofs')
            .upload(filePath, photoFile);
        if (uploadError) throw new Error(`Gagal mengupload foto: ${uploadError.message}`);
        
        const { data, error: updateError } = await supabase
            .from('employee_attendances')
            .update({
                clock_out: new Date().toISOString(), // Waktu saat ini
                clock_out_photo_path: filePath,
                clock_out_latitude: location?.coords?.latitude ?? null,
                clock_out_longitude: location?.coords?.longitude ?? null
            })
            .eq('id', lastAttendance.value.id) // Update baris absensi yang terakhir
            .select()
            .single();
        if (updateError) throw updateError;

        lastAttendance.value = data;
        uiStore.showNotification('Clock Out berhasil!', 'success');
    } catch (e) {
        uiStore.showNotification(e.message, 'error');
    } finally {
        loading.value = false;
    }
  }

  async function fetchMyDashboard() {
    loading.value = true;
    dashboardData.value = null;
    try {
        const { data, error } = await supabase.rpc('get_my_attendance_dashboard');
        if (error) throw error;
        dashboardData.value = data;
    } catch (e) {
        uiStore.showNotification(`Gagal mengambil data dasbor absensi: ${e.message}`, 'error');
    } finally {
        loading.value = false;
    }
  }

  return { 
    loading, 
    lastAttendance,
    currentStatus, // expose getter
    dashboardData,
    fetchMyLastStatus,
    fetchMyDashboard,
    clockIn,
    clockOut,
  };
});