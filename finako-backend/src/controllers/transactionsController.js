const transactionsModel = require('../models/transactionsModel');

exports.getAll = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const data = await transactionsModel.getAll(organizationId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const transaction = await transactionsModel.getById(id, organizationId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const transactionData = { ...req.body, organization_id: organizationId };
    const transaction = await transactionsModel.create(transactionData);
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const transaction = await transactionsModel.update(id, req.body, organizationId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const result = await transactionsModel.remove(id, organizationId);
    if (!result) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    next(err);
  }
};
