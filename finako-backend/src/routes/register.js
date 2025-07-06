const express = require('express');
const router = express.Router();
const { createTenant, getPackages, checkEmailAvailability } = require('../controllers/registerController');

// GET /api/packages - Get available packages
router.get('/packages', getPackages);

// GET /api/register/check-email - Check email availability
router.get('/register/check-email', checkEmailAvailability);

// POST /api/register - Create new tenant
router.post('/register', createTenant);

module.exports = router;
