const supabase = require('../models/db');

// Get user session info dengan organization status
exports.getSessionInfo = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required'
      });
    }
    
    // Get user profile dengan organization info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) throw profileError;
    
    // Get organization membership
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select(`
        role,
        organizations!inner(
          id,
          name,
          status,
          package_id,
          created_at
        )
      `)
      .eq('user_id', userId)
      .single();
    
    if (membershipError) {
      if (membershipError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'User tidak memiliki organisasi'
        });
      }
      throw membershipError;
    }
    
    // Get business profile untuk check onboarding completion
    const { data: businessProfile, error: businessError } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('organization_id', membership.organizations.id)
      .single();
    
    // Business profile error is OK (belum ada = belum onboarding)
    
    // Get organization features
    const { data: features, error: featuresError } = await supabase
      .from('organization_features')
      .select(`
        is_enabled,
        features(id, name)
      `)
      .eq('organization_id', membership.organizations.id)
      .eq('is_enabled', true);
    
    if (featuresError) throw featuresError;
    
    // Determine next step based on organization status dan business profile
    let nextStep = 'dashboard';
    
    if (membership.organizations.status === 'pending') {
      nextStep = 'payment_info';
    } else if (membership.organizations.status === 'active' && !businessProfile) {
      nextStep = 'onboarding';
    }
    
    res.json({
      success: true,
      data: {
        user: profile,
        organization: membership.organizations,
        role: membership.role,
        business_profile: businessProfile || null,
        active_features: features?.map(f => f.features.id) || [],
        next_step: nextStep
      }
    });
    
  } catch (err) {
    next(err);
  }
};

// Logout endpoint
exports.logout = async (req, res, next) => {
  try {
    // Note: Actual logout will be handled by frontend (Supabase client)
    // This endpoint is just for logging/tracking purposes
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (err) {
    next(err);
  }
};
