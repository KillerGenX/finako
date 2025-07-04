const supabase = require('./db');

exports.getAll = async (organizationId, startDate, endDate) => {
  let query = supabase.from('sales')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  
  if (startDate) query = query.gte('created_at', startDate);
  if (endDate) query = query.lte('created_at', endDate + 'T23:59:59');
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

exports.getById = async (id, organizationId) => {
  const { data, error } = await supabase.from('sales')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};

exports.create = async (sale) => {
  const { data, error } = await supabase.from('sales')
    .insert([sale])
    .select()
    .single();
  if (error) throw error;
  return data;
};

exports.update = async (id, updates, organizationId) => {
  const { data, error } = await supabase.from('sales')
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
  const { data, error } = await supabase.from('sales')
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
