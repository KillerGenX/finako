const supabase = require('./db');

exports.getAll = async (organization_id, start_date, end_date) => {
  let query = supabase.from('sales').select('*').order('created_at', { ascending: false });
  if (organization_id) query = query.eq('organization_id', organization_id);
  if (start_date) query = query.gte('created_at', start_date);
  if (end_date) query = query.lte('created_at', end_date + 'T23:59:59');
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

exports.create = async (sale) => {
  // Insert ke tabel sales
  const { data, error } = await supabase.from('sales').insert([sale]).select().single();
  if (error) throw error;
  return data;
};
