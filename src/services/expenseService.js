const { v4: uuidv4, validate: isUuid } = require('uuid');
const { readExpenses, writeExpenses } = require('../utils/fileStorage');
const ApiError = require('../utils/ApiError');

/**
 * Validates the payload for creating a new expense.
 * Throws an ApiError(400) with a list of details if invalid.
 * @param {object} payload
 */
function validateExpensePayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    throw new ApiError(400, 'Request body must be a JSON object.');
  }

  const { title, amount, category, date } = payload;

  // title: required, non-empty string
  if (title === undefined || title === null || String(title).trim() === '') {
    errors.push('title is required and cannot be empty.');
  } else if (typeof title !== 'string') {
    errors.push('title must be a string.');
  }

  // category: required, non-empty string
  if (category === undefined || category === null || String(category).trim() === '') {
    errors.push('category is required and cannot be empty.');
  } else if (typeof category !== 'string') {
    errors.push('category must be a string.');
  }

  // amount: required, must be a number > 0
  if (amount === undefined || amount === null || amount === '') {
    errors.push('amount is required.');
  } else {
    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount)) {
      errors.push('amount must be a valid number.');
    } else if (numericAmount <= 0) {
      errors.push('amount must be greater than 0.');
    }
  }

  // date: required, must be a valid date
  if (date === undefined || date === null || String(date).trim() === '') {
    errors.push('date is required.');
  } else {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      errors.push('date must be a valid date (e.g. YYYY-MM-DD).');
    }
  }

  if (errors.length > 0) {
    throw new ApiError(400, 'Validation failed.', errors);
  }
}

/**
 * Creates a new expense and persists it to storage.
 * @param {object} payload - { title, amount, category, date }
 * @returns {Promise<object>} The newly created expense.
 */
async function createExpense(payload) {
  validateExpensePayload(payload);

  const expenses = await readExpenses();

  const newExpense = {
    id: uuidv4(),
    title: String(payload.title).trim(),
    amount: Number(payload.amount),
    category: String(payload.category).trim(),
    date: new Date(payload.date).toISOString(),
  };

  expenses.push(newExpense);
  await writeExpenses(expenses);

  return newExpense;
}

/**
 * Retrieves all expenses, optionally filtered by category.
 * @param {object} filters - { category }
 * @returns {Promise<Array>} Filtered array of expenses.
 */
async function getAllExpenses(filters = {}) {
  const expenses = await readExpenses();
  const { category } = filters;

  if (category === undefined || category === null || String(category).trim() === '') {
    return expenses;
  }

  const normalizedCategory = String(category).trim().toLowerCase();
  return expenses.filter(
    (expense) => expense.category.toLowerCase() === normalizedCategory
  );
}

/**
 * Calculates the total amount of expenses, optionally filtered by category.
 * @param {object} filters - { category }
 * @returns {Promise<number>} The total amount, rounded to 2 decimal places.
 */
async function getTotal(filters = {}) {
  const expenses = await getAllExpenses(filters);
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  // Round to 2 decimal places to avoid floating point artifacts
  return Math.round((total + Number.EPSILON) * 100) / 100;
}

/**
 * Deletes an expense by id.
 * @param {string} id
 * @returns {Promise<object>} The deleted expense.
 */
async function deleteExpense(id) {
  if (!id || typeof id !== 'string') {
    throw new ApiError(400, 'A valid expense id must be provided.');
  }

  const expenses = await readExpenses();
  const index = expenses.findIndex((expense) => expense.id === id);

  if (index === -1) {
    throw new ApiError(404, `Expense with id "${id}" was not found.`);
  }

  const [deleted] = expenses.splice(index, 1);
  await writeExpenses(expenses);

  return deleted;
}

module.exports = {
  createExpense,
  getAllExpenses,
  getTotal,
  deleteExpense,
  validateExpensePayload,
  isUuid,
};