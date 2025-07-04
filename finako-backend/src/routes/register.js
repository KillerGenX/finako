const express = require('express');
const router = express.Router();
const { createTenant } = require('../controllers/registerController');

// POST /api/register
router.post('/', createTenant);

module.exports = router;
