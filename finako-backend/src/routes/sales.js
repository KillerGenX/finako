const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');


// GET /api/sales?organization_id=xxx
router.get('/', salesController.getAll);

// POST /api/sales
router.post('/', salesController.create);

module.exports = router;
