const businessProfilesModel = require('../models/businessProfilesModel');

exports.get = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const profile = await businessProfilesModel.getByOrganization(organizationId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

exports.createOrUpdate = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const profileData = { ...req.body, organization_id: organizationId };
    const profile = await businessProfilesModel.createOrUpdate(profileData);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

exports.setup = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const userId = req.userId;
    
    // Initial business profile setup for onboarding
    const setupData = {
      organization_id: organizationId,
      fixed_costs: req.body.fixed_costs || 0,
      avg_variable_cost: req.body.avg_variable_cost || 0,
      avg_selling_price: req.body.avg_selling_price || 0,
      tax_enabled: req.body.tax_enabled || false,
      tax_percent: req.body.tax_percent || 0,
      service_charge_enabled: req.body.service_charge_enabled || false,
      service_charge_percent: req.body.service_charge_percent || 0
    };
    
    const profile = await businessProfilesModel.createOrUpdate(setupData);
    res.status(201).json({
      success: true,
      message: 'Business profile setup completed',
      data: profile
    });
  } catch (err) {
    next(err);
  }
};
