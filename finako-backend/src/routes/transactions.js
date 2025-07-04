const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');


// GET /api/transactions?organization_id=xxx
router.get('/', transactionsController.getAll);

// POST /api/transactions
router.post('/', transactionsController.create);

module.exports = router;
