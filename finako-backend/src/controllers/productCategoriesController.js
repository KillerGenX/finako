const productCategoriesModel = require('../models/productCategoriesModel');

exports.getAll = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const categories = await productCategoriesModel.getAll(organizationId);
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const category = await productCategoriesModel.getById(id, organizationId);
    if (!category) {
      return res.status(404).json({ error: 'Product category not found' });
    }
    res.json(category);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const categoryData = { ...req.body, organization_id: organizationId };
    const category = await productCategoriesModel.create(categoryData);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const category = await productCategoriesModel.update(id, req.body, organizationId);
    if (!category) {
      return res.status(404).json({ error: 'Product category not found' });
    }
    res.json(category);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { id } = req.params;
    const category = await productCategoriesModel.remove(id, organizationId);
    if (!category) {
      return res.status(404).json({ error: 'Product category not found' });
    }
    res.json(category);
  } catch (err) {
    next(err);
  }
};
