const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Middleware validateMembership sudah diterapkan di index.js untuk /api/sales
// GET /api/sales?organization_id=xxx
router.get('/', salesController.getAll);
// POST /api/sales
router.post('/', salesController.create);
// GET /api/sales/:id
router.get('/:id', salesController.getById);
// PUT /api/sales/:id
router.put('/:id', salesController.update);
// DELETE /api/sales/:id
router.delete('/:id', salesController.remove);

module.exports = router;
