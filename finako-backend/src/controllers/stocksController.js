const stocksModel = require('../models/stocksModel');

exports.getAll = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const outletId = req.outletId;
    const data = await stocksModel.getAll(organizationId, outletId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const stock = await stocksModel.getById(id, organizationId);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json(stock);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const outletId = req.outletId;
    const stockData = { ...req.body, organization_id: organizationId, outlet_id: outletId };
    const stock = await stocksModel.create(stockData);
    res.status(201).json(stock);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const stock = await stocksModel.update(id, req.body, organizationId);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json(stock);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const result = await stocksModel.remove(id, organizationId);
    if (!result) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json({ message: 'Stock deleted successfully' });
  } catch (err) {
    next(err);
  }
};
