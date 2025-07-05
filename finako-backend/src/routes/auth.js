const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Auth routes
router.get('/session/:userId', authController.getSessionInfo);
router.post('/logout', authController.logout);

module.exports = router;
