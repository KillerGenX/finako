const supabase = require('./db');

// Get all product categories for specific organization
exports.getAll = async (organizationId) => {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Get product category by ID for specific organization
exports.getById = async (id, organizationId) => {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Create new product category
exports.create = async (category) => {
  const categoryData = {
    ...category,
    created_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('product_categories')
    .insert([categoryData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Update product category
exports.update = async (id, updates, organizationId) => {
  const { data, error } = await supabase
    .from('product_categories')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Delete product category
exports.remove = async (id, organizationId) => {
  const { data, error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};
