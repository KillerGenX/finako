const transactionsModel = require('../models/transactionsModel');

exports.getAll = async (req, res, next) => {
  try {
    // Ambil organization_id dari query atau header (opsional)
    const orgId = req.query.organization_id || req.headers['x-organization-id'];
    const data = await transactionsModel.getAll(orgId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const trx = await transactionsModel.create(req.body);
    res.status(201).json(trx);
  } catch (err) {
    next(err);
  }
};
