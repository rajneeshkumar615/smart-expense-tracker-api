const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Smart Expense Tracker API running at http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
});