const supabase = require('./db');

exports.getAll = async (organization_id, outlet_id) => {
  let query = supabase.from('stocks').select('*, products(name, sku, category_id, unit)').eq('organization_id', organization_id);
  if (outlet_id) query = query.eq('outlet_id', outlet_id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

exports.create = async (stock) => {
  const { data, error } = await supabase.from('stocks').insert([stock]).select().single();
  if (error) throw error;
  return data;
};

exports.update = async (id, stock) => {
  const { data, error } = await supabase.from('stocks').update(stock).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

exports.remove = async (id, organization_id) => {
  const { error } = await supabase.from('stocks').delete().eq('id', id).eq('organization_id', organization_id);
  if (error) throw error;
  return true;
};
