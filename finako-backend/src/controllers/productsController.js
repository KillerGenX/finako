// src/controllers/productsController.js
const productsModel = require('../models/productsModel');

exports.getAll = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const products = await productsModel.getAll(organizationId);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const product = await productsModel.getById(id, organizationId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const productData = { ...req.body, organization_id: organizationId };
    const product = await productsModel.create(productData);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const product = await productsModel.update(id, req.body, organizationId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const result = await productsModel.remove(id, organizationId);
    if (!result) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};
