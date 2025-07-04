// Middleware untuk validasi user adalah anggota organization dan outlet (multi tenant & multi outlet)
const supabase = require('../models/db');

module.exports = async function validateMembership(req, res, next) {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    const organizationId = req.query.organization_id || req.body.organization_id;
    const outletId = req.query.outlet_id || req.body.outlet_id;
    if (!userId || !organizationId) {
      return res.status(400).json({ error: 'organization_id dan user_id wajib dikirim' });
    }
    // Cek membership user di organisasi
    const { data: member, error } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    if (error || !member) {
      return res.status(403).json({ error: 'Akses ditolak: Anda bukan anggota organisasi ini.' });
    }
    // (Opsional) Validasi outlet milik organisasi
    if (outletId) {
      const { data: outlet, error: outletError } = await supabase
        .from('outlets')
        .select('id, organization_id')
        .eq('id', outletId)
        .eq('organization_id', organizationId)
        .single();
      if (outletError || !outlet) {
        return res.status(403).json({ error: 'Akses outlet ditolak: Outlet tidak ditemukan di organisasi ini.' });
      }
    }
    // Lolos validasi
    req.organizationId = organizationId;
    req.outletId = outletId;
    req.userRole = member.role;
    next();
  } catch (err) {
    next(err);
  }
}
