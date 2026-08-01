const expenseService = require('../services/expenseService');

/**
 * POST /api/expenses
 * Creates a new expense.
 */
async function createExpense(req, res, next) {
  try {
    const expense = await expenseService.createExpense(req.body);
    return res.status(201).json({
      success: true,
      message: 'Expense created successfully.',
      data: expense,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/expenses
 * GET /api/expenses?category=Food
 * Returns all expenses, optionally filtered by category.
 */
async function getExpenses(req, res, next) {
  try {
    const { category } = req.query;
    const expenses = await expenseService.getAllExpenses({ category });
    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/expenses/total
 * GET /api/expenses/total?category=Food
 * Returns the total of all (optionally filtered) expenses.
 */
async function getTotal(req, res, next) {
  try {
    const { category } = req.query;
    const total = await expenseService.getTotal({ category });
    return res.status(200).json({ total });
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE /api/expenses/:id
 * Deletes an expense by id.
 */
async function deleteExpense(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await expenseService.deleteExpense(id);
    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully.',
      data: deleted,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createExpense,
  getExpenses,
  getTotal,
  deleteExpense,
};