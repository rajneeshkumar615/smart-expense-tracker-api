# Smart Expense Tracker API

A production-quality REST API for tracking personal expenses, built with **Node.js** and **Express**, using a **layered architecture** (routes → controllers → services → utils) and a local JSON file as storage (no database).

---

## Features

- Create, list, filter, and delete expenses
- Calculate total expenses, optionally filtered by category
- Input validation with descriptive error messages
- Centralized error handling middleware
- Swagger/OpenAPI documentation at `/api-docs`
- Full Jest + Supertest test suite

---

## Folder Structure

```
README.md
AI_NOTES.md
package.json
src/
  app.js                        # Express app configuration (middleware, routes)
  server.js                     # Server entry point
  swagger.yaml                  # OpenAPI spec used for /api-docs
  routes/
    expenseRoutes.js            # Route definitions (routes -> controllers only)
  controllers/
    expenseController.js        # HTTP layer (controllers -> services only)
  services/
    expenseService.js           # All business logic + validation
  middleware/
    errorHandler.js             # Centralized error handling middleware
  utils/
    fileStorage.js              # Read/write JSON data file
    ApiError.js                 # Custom error class
  data/
    expenses.json                # Local JSON "database"
tests/
  expense.test.js                # Jest + Supertest test suite
```

**Architecture rules enforced in this project:**
- Routes only call controllers.
- Controllers only call services (no business logic in controllers).
- Services contain all business logic and validation.
- Utilities are only responsible for reading/writing the JSON file.
- All async operations use `async/await`.
- All errors flow through the centralized error middleware.

---

## Installation

Requires Node.js 16+.

```bash
npm install
```

## Running the API

Start in development mode (auto-restarts on file changes via nodemon):

```bash
npm run dev
```

Or start normally:

```bash
npm start
```

The API will be available at `http://localhost:3000`.

Swagger documentation will be available at `http://localhost:3000/api-docs`.

## Testing

Run the full Jest + Supertest test suite:

```bash
npm test
```

The test suite resets `src/data/expenses.json` before each test to guarantee a clean, predictable state, and covers:
- Creating an expense (success + validation errors)
- Getting all expenses
- Filtering expenses by category
- Calculating totals (overall and filtered)
- Deleting an expense (success + not-found)
- Unknown routes returning 404

---

## API Endpoints

### 1. Create an expense

`POST /api/expenses`

**Request body:**
```json
{
  "title": "Groceries",
  "amount": 45.5,
  "category": "Food",
  "date": "2025-01-15"
}
```

**Success response — `201 Created`:**
```json
{
  "success": true,
  "message": "Expense created successfully.",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Groceries",
    "amount": 45.5,
    "category": "Food",
    "date": "2025-01-15T00:00:00.000Z"
  }
}
```

**Validation error response — `400 Bad Request`:**
```json
{
  "success": false,
  "message": "Validation failed.",
  "details": [
    "title is required and cannot be empty.",
    "amount must be greater than 0."
  ]
}
```

Validation rules:
| Field    | Rule                                   |
|----------|-----------------------------------------|
| title    | required, non-empty string             |
| category | required, non-empty string             |
| amount   | required, numeric, must be greater than 0 |
| date     | required, must be a valid date         |

---

### 2. Get all expenses

`GET /api/expenses`

**Success response — `200 OK`:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    { "id": "...", "title": "Groceries", "amount": 45.5, "category": "Food", "date": "2025-01-15T00:00:00.000Z" },
    { "id": "...", "title": "Bus ticket", "amount": 2.5, "category": "Transport", "date": "2025-01-16T00:00:00.000Z" }
  ]
}
```

**Filter by category:**

`GET /api/expenses?category=Food`

Category filtering is case-insensitive.

---

### 3. Get total expenses

`GET /api/expenses/total`

**Success response — `200 OK`:**
```json
{
  "total": 1234
}
```

**Filter total by category:**

`GET /api/expenses/total?category=Food`

```json
{
  "total": 48
}
```

---

### 4. Delete an expense

`DELETE /api/expenses/:id`

**Success response — `200 OK`:**
```json
{
  "success": true,
  "message": "Expense deleted successfully.",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Groceries",
    "amount": 45.5,
    "category": "Food",
    "date": "2025-01-15T00:00:00.000Z"
  }
}
```

**Not found response — `404 Not Found`:**
```json
{
  "success": false,
  "message": "Expense with id \"non-existent-id\" was not found."
}
```

---

## Example requests (curl)

**Create an expense:**
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"title": "Groceries", "amount": 45.5, "category": "Food", "date": "2025-01-15"}'
```

**Get all expenses:**
```bash
curl http://localhost:3000/api/expenses
```

**Filter by category:**
```bash
curl "http://localhost:3000/api/expenses?category=Food"
```

**Get total:**
```bash
curl http://localhost:3000/api/expenses/total
```

**Get total filtered by category:**
```bash
curl "http://localhost:3000/api/expenses/total?category=Food"
```

**Delete an expense:**
```bash
curl -X DELETE http://localhost:3000/api/expenses/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

---

## Bonus: Swagger Documentation

Interactive API documentation is available once the server is running at:

```
http://localhost:3000/api-docs
```

It is generated from `src/swagger.yaml` using `swagger-ui-express`.