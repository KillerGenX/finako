const expensesModel = require('../models/expensesModel');

exports.getAll = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const data = await expensesModel.getAll(organizationId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const expense = await expensesModel.getById(id, organizationId);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const userId = req.user?.id || req.headers['x-user-id'];
    const expenseData = { ...req.body, organization_id: organizationId, user_id: userId };
    const expense = await expensesModel.create(expenseData);
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const expense = await expensesModel.update(id, req.body, organizationId);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const result = await expensesModel.remove(id, organizationId);
    if (!result) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    next(err);
  }
};
