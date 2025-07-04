const salesModel = require('../models/salesModel');

exports.getAll = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;
    const data = await salesModel.getAll(organizationId, startDate, endDate);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const saleData = { ...req.body, organization_id: organizationId };
    const sale = await salesModel.create(saleData);
    res.status(201).json(sale);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const sale = await salesModel.getById(id, organizationId);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    res.json(sale);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const sale = await salesModel.update(id, req.body, organizationId);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    res.json(sale);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const result = await salesModel.remove(id, organizationId);
    if (!result) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    res.json({ message: 'Sale deleted successfully' });
  } catch (err) {
    next(err);
  }
};
