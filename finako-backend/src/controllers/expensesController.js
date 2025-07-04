const expensesModel = require('../models/expensesModel');

exports.getAll = async (req, res, next) => {
  try {
    const orgId = req.query.organization_id || req.headers['x-organization-id'];
    const data = await expensesModel.getAll(orgId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const orgId = req.body.organization_id;
    const userId = req.body.user_id;
    const expense = await expensesModel.create({ ...req.body, organization_id: orgId, user_id: userId });
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const orgId = req.body.organization_id;
    const userId = req.body.user_id;
    const expense = await expensesModel.update(id, { ...req.body, organization_id: orgId, user_id: userId });
    res.json(expense);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const orgId = req.query.organization_id || req.headers['x-organization-id'];
    await expensesModel.remove(id, orgId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
