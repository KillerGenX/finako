const expenseCategoriesModel = require('../models/expenseCategoriesModel');

exports.getAll = async (req, res, next) => {
  try {
    const orgId = req.query.organization_id || req.headers['x-organization-id'];
    const data = await expenseCategoriesModel.getAll(orgId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const orgId = req.body.organization_id;
    const userId = req.body.user_id;
    const category = await expenseCategoriesModel.create({ ...req.body, organization_id: orgId, user_id: userId });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const orgId = req.body.organization_id;
    const userId = req.body.user_id;
    const category = await expenseCategoriesModel.update(id, { ...req.body, organization_id: orgId, user_id: userId });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const orgId = req.query.organization_id || req.headers['x-organization-id'];
    await expenseCategoriesModel.remove(id, orgId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
