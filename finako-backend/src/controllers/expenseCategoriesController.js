const expenseCategoriesModel = require('../models/expenseCategoriesModel');

exports.getAll = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const data = await expenseCategoriesModel.getAll(organizationId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const category = await expenseCategoriesModel.getById(id, organizationId);
    if (!category) {
      return res.status(404).json({ error: 'Expense category not found' });
    }
    res.json(category);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const userId = req.user?.id || req.headers['x-user-id'];
    const categoryData = { ...req.body, organization_id: organizationId, user_id: userId };
    const category = await expenseCategoriesModel.create(categoryData);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const category = await expenseCategoriesModel.update(id, req.body, organizationId);
    if (!category) {
      return res.status(404).json({ error: 'Expense category not found' });
    }
    res.json(category);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const result = await expenseCategoriesModel.remove(id, organizationId);
    if (!result) {
      return res.status(404).json({ error: 'Expense category not found' });
    }
    res.json({ message: 'Expense category deleted successfully' });
  } catch (err) {
    next(err);
  }
};
