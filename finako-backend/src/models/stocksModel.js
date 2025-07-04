const supabase = require('./db');

exports.getAll = async (organizationId, outletId) => {
  let query = supabase.from('stocks')
    .select('*, products(name, sku, category_id, unit)')
    .eq('organization_id', organizationId);
  if (outletId) query = query.eq('outlet_id', outletId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

exports.getById = async (id, organizationId) => {
  const { data, error } = await supabase.from('stocks')
    .select('*, products(name, sku, category_id, unit)')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};

exports.create = async (stock) => {
  const { data, error } = await supabase.from('stocks')
    .insert([stock])
    .select()
    .single();
  if (error) throw error;
  return data;
};

exports.update = async (id, updates, organizationId) => {
  const { data, error } = await supabase.from('stocks')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};

exports.remove = async (id, organizationId) => {
  const { data, error } = await supabase.from('stocks')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};
