const supabase = require('./db');

// Get business profile by organization ID
exports.getByOrganization = async (organizationId) => {
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data; // Return null if not found
};

// Create or update business profile (upsert)
exports.createOrUpdate = async (profileData) => {
  const { data, error } = await supabase
    .from('business_profiles')
    .upsert(profileData, { 
      onConflict: 'organization_id',
      ignoreDuplicates: false 
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Create new business profile
exports.create = async (profileData) => {
  const { data, error } = await supabase
    .from('business_profiles')
    .insert([profileData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Update business profile
exports.update = async (organizationId, updates) => {
  const { data, error } = await supabase
    .from('business_profiles')
    .update(updates)
    .eq('organization_id', organizationId)
    .select()
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};
