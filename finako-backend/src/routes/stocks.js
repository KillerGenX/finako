const express = require('express');
const router = express.Router();
const stocksController = require('../controllers/stocksController');
const validateMembership = require('../middlewares/validateMembership');

// GET /api/stocks?organization_id=...&outlet_id=...
router.get('/', validateMembership, stocksController.getAll);
// POST /api/stocks
router.post('/', validateMembership, stocksController.create);
// PUT /api/stocks/:id
router.put('/:id', validateMembership, stocksController.update);
// DELETE /api/stocks/:id
router.delete('/:id', validateMembership, stocksController.remove);

module.exports = router;
