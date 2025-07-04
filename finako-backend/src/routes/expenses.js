const express = require('express');
const router = express.Router();
const expensesController = require('../controllers/expensesController');

// GET /api/expenses?organization_id=xxx
router.get('/', expensesController.getAll);
// POST /api/expenses
router.post('/', expensesController.create);
// PUT /api/expenses/:id
router.put('/:id', expensesController.update);
// DELETE /api/expenses/:id
router.delete('/:id', expensesController.remove);

module.exports = router;
