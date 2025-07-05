const supabase = require('./db');

// Get all features for organization with feature details
exports.getAll = async (organizationId) => {
  const { data, error } = await supabase
    .from('organization_features')
    .select(`
      *,
      features!inner(
        id,
        name,
        description
      )
    `)
    .eq('organization_id', organizationId)
    .order('features.name', { ascending: true });
    
  if (error) throw error;
  return data;
};

// Get only enabled features for organization
exports.getEnabled = async (organizationId) => {
  const { data, error } = await supabase
    .from('organization_features')
    .select(`
      *,
      features!inner(
        id,
        name,
        description
      )
    `)
    .eq('organization_id', organizationId)
    .eq('is_enabled', true)
    .order('features.name', { ascending: true });
    
  if (error) throw error;
  return data;
};

// Update feature settings for organization
exports.updateFeature = async (organizationId, featureId, updates) => {
  const { data, error } = await supabase
    .from('organization_features')
    .update(updates)
    .eq('organization_id', organizationId)
    .eq('feature_id', featureId)
    .select(`
      *,
      features!inner(
        id,
        name,
        description
      )
    `)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Get feature by ID for organization
exports.getByFeatureId = async (organizationId, featureId) => {
  const { data, error } = await supabase
    .from('organization_features')
    .select(`
      *,
      features!inner(
        id,
        name,
        description
      )
    `)
    .eq('organization_id', organizationId)
    .eq('feature_id', featureId)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};
