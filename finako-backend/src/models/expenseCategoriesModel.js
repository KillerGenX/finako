const db = require('./db');

exports.getAll = async (organization_id) => {
  if (!organization_id) return [];
  const { data, error } = await db.from('expense_categories')
    .select('*')
    .eq('organization_id', organization_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

exports.create = async (category) => {
  const { data, error } = await db.from('expense_categories').insert([category]).select().single();
  if (error) throw error;
  return data;
};

exports.update = async (id, category) => {
  const { data, error } = await db.from('expense_categories').update(category).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

exports.remove = async (id, organization_id) => {
  const { error } = await db.from('expense_categories').delete().eq('id', id).eq('organization_id', organization_id);
  if (error) throw error;
  return true;
};
