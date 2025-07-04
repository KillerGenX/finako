// src/routes/products.js
const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const validateMembership = require('../middlewares/validateMembership');

// TODO: Tambahkan middleware validasi jika sudah siap
router.get('/', validateMembership, productsController.getAll);
router.post('/', validateMembership, productsController.create);
router.get('/:id', validateMembership, productsController.getById);
router.put('/:id', validateMembership, productsController.update);
router.delete('/:id', validateMembership, productsController.remove);

module.exports = router;
