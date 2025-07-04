const express = require('express');
const router = express.Router();
const expenseCategoriesController = require('../controllers/expenseCategoriesController');

// Middleware validateMembership sudah diterapkan di index.js untuk /api/expense-categories
// GET /api/expense-categories?organization_id=xxx
router.get('/', expenseCategoriesController.getAll);
// POST /api/expense-categories
router.post('/', expenseCategoriesController.create);
// GET /api/expense-categories/:id
router.get('/:id', expenseCategoriesController.getById);
// PUT /api/expense-categories/:id
router.put('/:id', expenseCategoriesController.update);
// DELETE /api/expense-categories/:id
router.delete('/:id', expenseCategoriesController.remove);

module.exports = router;
