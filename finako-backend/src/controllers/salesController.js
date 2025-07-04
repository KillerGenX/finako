const salesModel = require('../models/salesModel');

exports.getAll = async (req, res, next) => {
  try {
    // Ambil organization_id dan filter tanggal dari query
    const orgId = req.query.organization_id || req.headers['x-organization-id'];
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;
    const data = await salesModel.getAll(orgId, startDate, endDate);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const sale = await salesModel.create(req.body);
    res.status(201).json(sale);
  } catch (err) {
    next(err);
  }
};
