const express = require('express');
const router = express.Router();
const outletsController = require('../controllers/outletsController');

// Middleware validateMembership sudah diterapkan di index.js untuk /api/outlets
router.get('/', outletsController.getAll);
router.post('/', outletsController.create);
router.get('/:id', outletsController.getById);
router.put('/:id', outletsController.update);
router.delete('/:id', outletsController.remove);

module.exports = router;
