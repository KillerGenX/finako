const supabase = require('./db');

// Get all members of an organization
exports.getOrganizationMembers = async (organizationId) => {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      role,
      created_at,
      profiles!inner(
        id,
        email,
        full_name
      )
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

// Get specific member by user ID and organization
exports.getMemberById = async (userId, organizationId) => {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      role,
      created_at,
      profiles!inner(
        id,
        email,
        full_name
      )
    `)
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Create new organization member
exports.createMember = async (memberData) => {
  const { email, password, full_name, role, organization_id } = memberData;
  
  try {
    // 1. Create user in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm for organization members
    });
    
    if (signUpError) throw signUpError;
    const user = signUpData.user;
    
    // 2. Add to profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: email,
        full_name: full_name || null
      });
    
    if (profileError) {
      // Cleanup if profile creation fails
      await supabase.auth.admin.deleteUser(user.id);
      throw profileError;
    }
    
    // 3. Add to organization_members
    const { data: memberData, error: memberError } = await supabase
      .from('organization_members')
      .insert({
        user_id: user.id,
        organization_id: organization_id,
        role: role
      })
      .select(`
        role,
        created_at,
        profiles!inner(
          id,
          email,
          full_name
        )
      `)
      .single();
    
    if (memberError) {
      // Cleanup if member creation fails
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.auth.admin.deleteUser(user.id);
      throw memberError;
    }
    
    return memberData;
    
  } catch (error) {
    throw error;
  }
};

// Update member role
exports.updateMemberRole = async (userId, organizationId, role) => {
  const { data, error } = await supabase
    .from('organization_members')
    .update({ role })
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .select(`
      role,
      created_at,
      profiles!inner(
        id,
        email,
        full_name
      )
    `)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Remove member from organization
exports.removeMember = async (userId, organizationId) => {
  const { data, error } = await supabase
    .from('organization_members')
    .delete()
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .select()
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};
