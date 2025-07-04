// src/models/productsModel.js
const supabase = require('./db');

// Get all products for specific organization
exports.getAll = async (organizationId) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Get product by ID for specific organization
exports.getById = async (id, organizationId) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Create new product
exports.create = async (product, organizationId) => {
  const productData = {
    ...product,
    organization_id: organizationId,
    created_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Update product
exports.update = async (id, updates, organizationId) => {
  const { data, error } = await supabase
    .from('products')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Delete product
exports.remove = async (id, organizationId) => {
  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single();
  if (error) throw error;
  return data;
};
