const db = require('./db');

exports.getAll = async (organization_id) => {
  if (!organization_id) return [];
  const { data, error } = await db.from('expenses')
    .select('*, expense_categories(name)')
    .eq('organization_id', organization_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

exports.create = async (expense) => {
  const { data, error } = await db.from('expenses').insert([expense]).select().single();
  if (error) throw error;
  return data;
};

exports.update = async (id, expense) => {
  const { data, error } = await db.from('expenses').update(expense).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

exports.remove = async (id, organization_id) => {
  const { error } = await db.from('expenses').delete().eq('id', id).eq('organization_id', organization_id);
  if (error) throw error;
  return true;
};
