// src/controllers/productsController.js
const productsModel = require('../models/productsModel');

exports.getAll = async (req, res, next) => {
  try {
    const products = await productsModel.getAll();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const product = await productsModel.getById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const product = await productsModel.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const product = await productsModel.update(req.params.id, req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await productsModel.remove(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
