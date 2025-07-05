const express = require('express');
const router = express.Router();
const businessProfilesController = require('../controllers/businessProfilesController');

// Middleware validateMembership sudah diterapkan di index.js untuk /api/business-profile
router.get('/', businessProfilesController.get);
router.put('/', businessProfilesController.createOrUpdate);
router.post('/setup', businessProfilesController.setup);

module.exports = router;
