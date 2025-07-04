const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');

// Middleware validateMembership sudah diterapkan di index.js untuk /api/transactions
// GET /api/transactions?organization_id=xxx
router.get('/', transactionsController.getAll);
// POST /api/transactions
router.post('/', transactionsController.create);
// GET /api/transactions/:id
router.get('/:id', transactionsController.getById);
// PUT /api/transactions/:id
router.put('/:id', transactionsController.update);
// DELETE /api/transactions/:id
router.delete('/:id', transactionsController.remove);

module.exports = router;
