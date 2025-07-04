const stocksModel = require('../models/stocksModel');

exports.getAll = async (req, res, next) => {
  try {
    const { organizationId, outletId } = req;
    const data = await stocksModel.getAll(organizationId, outletId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const stock = await stocksModel.create(req.body);
    res.status(201).json(stock);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const stock = await stocksModel.update(req.params.id, req.body);
    res.json(stock);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await stocksModel.remove(req.params.id, req.organizationId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
