const supabase = require('./db');

exports.getAll = async (organization_id) => {
  let query = supabase.from('transactions').select('*').order('created_at', { ascending: false });
  if (organization_id) query = query.eq('organization_id', organization_id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

exports.create = async (trx) => {
  // Insert ke tabel transactions
  const { data, error } = await supabase.from('transactions').insert([trx]).select().single();
  if (error) throw error;
  return data;
};
