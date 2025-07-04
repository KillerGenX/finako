const express = require('express');
const router = express.Router();
const stocksController = require('../controllers/stocksController');

// Middleware validateMembership sudah diterapkan di index.js untuk /api/stocks
// GET /api/stocks?organization_id=...&outlet_id=...
router.get('/', stocksController.getAll);
// POST /api/stocks
router.post('/', stocksController.create);
// GET /api/stocks/:id
router.get('/:id', stocksController.getById);
// PUT /api/stocks/:id
router.put('/:id', stocksController.update);
// DELETE /api/stocks/:id
router.delete('/:id', stocksController.remove);

module.exports = router;
