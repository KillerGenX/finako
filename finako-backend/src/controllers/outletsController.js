const outletsModel = require('../models/outletsModel');

exports.getAll = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const outlets = await outletsModel.getAll(organizationId);
    res.json(outlets);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const outlet = await outletsModel.getById(id, organizationId);
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }
    res.json(outlet);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const outletData = { ...req.body, organization_id: organizationId };
    const outlet = await outletsModel.create(outletData);
    res.status(201).json(outlet);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const outlet = await outletsModel.update(id, req.body, organizationId);
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }
    res.json(outlet);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const outlet = await outletsModel.remove(id, organizationId);
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }
    res.json(outlet);
  } catch (err) {
    next(err);
  }
};
