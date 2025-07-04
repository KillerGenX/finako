const customersModel = require('../models/customersModel');

exports.create = async (req, res, next) => {
  try {
    const customer = await customersModel.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
};
