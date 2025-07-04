const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController');

// Middleware validateMembership sudah diterapkan di index.js untuk /api/customers
router.get('/', customersController.getAll);
router.post('/', customersController.create);
router.get('/:id', customersController.getById);
router.put('/:id', customersController.update);
router.delete('/:id', customersController.remove);

module.exports = router;
