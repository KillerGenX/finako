const express = require('express');
const router = express.Router();
const expenseCategoriesController = require('../controllers/expenseCategoriesController');

// GET /api/expense-categories?organization_id=xxx
router.get('/', expenseCategoriesController.getAll);
// POST /api/expense-categories
router.post('/', expenseCategoriesController.create);
// PUT /api/expense-categories/:id
router.put('/:id', expenseCategoriesController.update);
// DELETE /api/expense-categories/:id
router.delete('/:id', expenseCategoriesController.remove);

module.exports = router;
