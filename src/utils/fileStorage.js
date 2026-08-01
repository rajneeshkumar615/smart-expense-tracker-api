const fs = require("fs").promises;
const path = require("path");

const filePath = path.join(__dirname, "../data/expenses.json");

async function readExpenses() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

async function writeExpenses(expenses) {
  await fs.writeFile(filePath, JSON.stringify(expenses, null, 2));
}

module.exports = {
  readExpenses,
  writeExpenses,
};