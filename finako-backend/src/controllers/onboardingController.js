const supabase = require('../models/db');

// Complete onboarding setup
exports.completeOnboarding = async (req, res, next) => {
  try {
    const { userId, organizationId } = req.params;
    const {
      // Business info
      business_name,
      business_address,
      business_phone,
      
      // Business profile config
      tax_enabled,
      tax_percent,
      service_charge_enabled,
      service_charge_percent,
      fixed_costs,
      avg_variable_cost,
      avg_selling_price,
      
      // Outlet info
      outlet_name,
      outlet_address
    } = req.body;
    
    // Validation
    if (!business_name || !outlet_name) {
      return res.status(400).json({
        error: 'Business name and outlet name are required'
      });
    }
    
    // Check if user owns this organization
    const { data: membership, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single();
    
    if (memberError || !membership || membership.role !== 'owner') {
      return res.status(403).json({
        error: 'Only organization owner can complete onboarding'
      });
    }
    
    // Start transaction-like operations
    try {
      // 1. Update organization with business info
      const { error: orgError } = await supabase
        .from('organizations')
        .update({
          name: business_name,
          address: business_address,
          phone: business_phone
        })
        .eq('id', organizationId);
      
      if (orgError) throw orgError;
      
      // 2. Create/update business profile
      const { error: profileError } = await supabase
        .from('business_profiles')
        .upsert({
          organization_id: organizationId,
          tax_enabled: tax_enabled || false,
          tax_percent: tax_percent || 0,
          service_charge_enabled: service_charge_enabled || false,
          service_charge_percent: service_charge_percent || 0,
          fixed_costs: fixed_costs || 0,
          avg_variable_cost: avg_variable_cost || 0,
          avg_selling_price: avg_selling_price || 0
        }, {
          onConflict: 'organization_id'
        });
      
      if (profileError) throw profileError;
      
      // 3. Create main outlet
      const { error: outletError } = await supabase
        .from('outlets')
        .insert({
          organization_id: organizationId,
          name: outlet_name,
          address: outlet_address || business_address
        });
      
      if (outletError) throw outletError;
      
      res.json({
        success: true,
        message: 'Onboarding completed successfully',
        next_step: 'dashboard'
      });
      
    } catch (setupError) {
      throw setupError;
    }
    
  } catch (err) {
    next(err);
  }
};

// Check onboarding status
exports.getOnboardingStatus = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    
    // Check if business profile exists
    const { data: businessProfile, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('organization_id', organizationId)
      .single();
    
    const isCompleted = !error && businessProfile;
    
    res.json({
      success: true,
      onboarding_completed: isCompleted,
      business_profile: businessProfile || null
    });
    
  } catch (err) {
    next(err);
  }
};
