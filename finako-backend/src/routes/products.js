// src/routes/products.js
const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');

// Middleware validateMembership sudah diterapkan di index.js untuk /api/products
router.get('/', productsController.getAll);
router.post('/', productsController.create);
router.get('/:id', productsController.getById);
router.put('/:id', productsController.update);
router.delete('/:id', productsController.remove);

module.exports = router;
