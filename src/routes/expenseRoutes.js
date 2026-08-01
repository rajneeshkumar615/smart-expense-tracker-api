const express = require('express');
const expenseController = require('../controllers/expenseController');

const router = express.Router();

// IMPORTANT: /total must be declared before /:id
// otherwise Express would treat "total" as an :id param.

// GET /api/expenses/total?category=Food
router.get('/total', expenseController.getTotal);

// POST /api/expenses
router.post('/', expenseController.createExpense);

// GET /api/expenses?category=Food
router.get('/', expenseController.getExpenses);

// DELETE /api/expenses/:id
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;