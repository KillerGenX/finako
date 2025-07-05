const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');

// Onboarding routes (should be protected by auth)
router.get('/status/:organizationId', onboardingController.getOnboardingStatus);
router.post('/complete/:userId/:organizationId', onboardingController.completeOnboarding);

module.exports = router;
