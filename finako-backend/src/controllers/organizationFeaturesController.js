const organizationFeaturesModel = require('../models/organizationFeaturesModel');

exports.getAll = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const features = await organizationFeaturesModel.getAll(organizationId);
    res.json(features);
  } catch (err) {
    next(err);
  }
};

exports.getEnabled = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const enabledFeatures = await organizationFeaturesModel.getEnabled(organizationId);
    res.json(enabledFeatures);
  } catch (err) {
    next(err);
  }
};

exports.toggle = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { featureId } = req.params;
    const { is_enabled } = req.body;
    
    const feature = await organizationFeaturesModel.updateFeature(
      organizationId, 
      featureId, 
      { is_enabled }
    );
    
    if (!feature) {
      return res.status(404).json({ error: 'Feature not found for this organization' });
    }
    
    res.json({
      success: true,
      message: `Feature ${is_enabled ? 'enabled' : 'disabled'} successfully`,
      data: feature
    });
  } catch (err) {
    next(err);
  }
};

exports.updateFeature = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { featureId } = req.params;
    const updates = req.body;
    
    const feature = await organizationFeaturesModel.updateFeature(
      organizationId, 
      featureId, 
      updates
    );
    
    if (!feature) {
      return res.status(404).json({ error: 'Feature not found for this organization' });
    }
    
    res.json(feature);
  } catch (err) {
    next(err);
  }
};
