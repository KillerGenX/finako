const supabase = require('./db');

// Get all outlets for specific organization
exports.getAll = async (organizationId) => {
  const { data, error } = await supabase
    .from('outlets')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Get outlet by ID for specific organization
exports.getById = async (id, organizationId) => {
  const { data, error } = await supabase
    .from('outlets')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Create new outlet
exports.create = async (outlet) => {
  const outletData = {
    ...outlet,
    created_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('outlets')
    .insert([outletData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Update outlet
exports.update = async (id, updates, organizationId) => {
  const { data, error } = await supabase
    .from('outlets')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Delete outlet
exports.remove = async (id, organizationId) => {
  const { data, error } = await supabase
    .from('outlets')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};
