const express = require('express');
const router = express.Router();
const organizationFeaturesController = require('../controllers/organizationFeaturesController');

// Middleware validateMembership sudah diterapkan di index.js untuk /api/organization-features
router.get('/', organizationFeaturesController.getAll);
router.get('/enabled', organizationFeaturesController.getEnabled);
router.put('/:featureId', organizationFeaturesController.updateFeature);
router.post('/:featureId/toggle', organizationFeaturesController.toggle);

module.exports = router;
