const express = require('express');
const router = express.Router();
const productCategoriesController = require('../controllers/productCategoriesController');

// Middleware validateMembership sudah diterapkan di index.js untuk /api/product-categories
router.get('/', productCategoriesController.getAll);
router.post('/', productCategoriesController.create);
router.get('/:id', productCategoriesController.getById);
router.put('/:id', productCategoriesController.update);
router.delete('/:id', productCategoriesController.remove);

module.exports = router;
