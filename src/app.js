const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const expenseRoutes = require('./routes/expenseRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Parse incoming JSON request bodies
app.use(express.json());

// Load Swagger/OpenAPI documentation
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Main API routes
app.use('/api/expenses', expenseRoutes);

// 404 handler for unknown routes
app.use(notFoundHandler);

// Centralized error handler (must be registered last)
app.use(errorHandler);

module.exports = app;