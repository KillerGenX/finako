// Controller: registerController.js
// Proses register tenant baru (semua di-backend)
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // gunakan service key untuk akses admin
);

async function createTenant(req, res) {
  try {
    const { email, password, businessName, packageId } = req.body;
    if (!email || !password || !businessName || !packageId) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }
    // 1. Register user di Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Langsung konfirmasi email agar bisa login tanpa verifikasi
    });
    if (signUpError) throw signUpError;
    const user = signUpData.user;

    // Tambahkan ke tabel profiles (agar FK organization_members valid)
    await supabase.from('profiles').insert({
      id: user.id,
      email: email,
      full_name: null // atau ownerName jika ingin diisi
    });

    // 2. Insert ke organizations
    const { data: orgData, error: orgErr } = await supabase
      .from('organizations')
      .insert({
        name: businessName,
        owner_id: user.id,
        // package_id: packageId, // Comment out package_id untuk sementara
        status: 'pending' // ubah dari waiting_payment ke pending
      })
      .select()
      .single();
    if (orgErr) throw orgErr;

    // 3. Insert owner ke organization_members
    await supabase.from('organization_members').insert({
      organization_id: orgData.id,
      user_id: user.id,
      role: 'owner'
    });
    // 4. Copy fitur dari package_features ke organization_features
    const { data: features } = await supabase
      .from('package_features')
      .select('feature_id, is_enabled, max_value')
      .eq('package_id', packageId);
    if (features && features.length > 0) {
      const orgFeatures = features.map(f => ({
        organization_id: orgData.id,
        feature_id: f.feature_id,
        is_enabled: f.is_enabled,
        max_value: f.max_value
      }));
      await supabase.from('organization_features').insert(orgFeatures);
    }
    return res.json({ success: true, message: 'Registrasi tenant berhasil', organization: orgData });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Registrasi gagal' });
  }
}

module.exports = { createTenant };
