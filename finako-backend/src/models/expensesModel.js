const db = require('./db');

exports.getAll = async (organizationId) => {
  const { data, error } = await db.from('expenses')
    .select('*, expense_categories(name)')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

exports.getById = async (id, organizationId) => {
  const { data, error } = await db.from('expenses')
    .select('*, expense_categories(name)')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};

exports.create = async (expense) => {
  const { data, error } = await db.from('expenses')
    .insert([expense])
    .select()
    .single();
  if (error) throw error;
  return data;
};

exports.update = async (id, updates, organizationId) => {
  const { data, error } = await db.from('expenses')
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
  const { data, error } = await db.from('expenses')
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
