const fs = require('fs');
const path = require('path');

const DATA_FILE_PATH = path.join(__dirname, '..', 'src', 'data', 'expenses.json');

// Reset the data file to an empty array before requiring the app,
// so every test run starts from a clean, predictable state.
beforeAll(() => {
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
});

// Ensure a clean slate before each individual test as well.
beforeEach(() => {
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
});

// Restore an empty file after all tests finish.
afterAll(() => {
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
});

const request = require('supertest');
const app = require('../src/app');

describe('Smart Expense Tracker API', () => {
  const validExpense = {
    title: 'Groceries',
    amount: 45.5,
    category: 'Food',
    date: '2025-01-15',
  };

  describe('POST /api/expenses', () => {
    it('creates a new expense with valid data', async () => {
      const res = await request(app).post('/api/expenses').send(validExpense);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe(validExpense.title);
      expect(res.body.data.amount).toBe(validExpense.amount);
      expect(res.body.data.category).toBe(validExpense.category);
      expect(new Date(res.body.data.date).toISOString()).toBe(res.body.data.date);
    });

    it('rejects an expense missing the title', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .send({ ...validExpense, title: undefined });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details).toEqual(
        expect.arrayContaining([expect.stringMatching(/title/i)])
      );
    });

    it('rejects an expense missing the category', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .send({ ...validExpense, category: '' });

      expect(res.status).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([expect.stringMatching(/category/i)])
      );
    });

    it('rejects an expense with amount <= 0', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .send({ ...validExpense, amount: 0 });

      expect(res.status).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([expect.stringMatching(/amount/i)])
      );
    });

    it('rejects an expense with a negative amount', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .send({ ...validExpense, amount: -10 });

      expect(res.status).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([expect.stringMatching(/amount/i)])
      );
    });

    it('rejects an expense with an invalid date', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .send({ ...validExpense, date: 'not-a-date' });

      expect(res.status).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([expect.stringMatching(/date/i)])
      );
    });

    it('rejects an expense with multiple missing fields and reports all of them', async () => {
      const res = await request(app).post('/api/expenses').send({});

      expect(res.status).toBe(400);
      expect(res.body.details.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('GET /api/expenses', () => {
    beforeEach(async () => {
      await request(app).post('/api/expenses').send(validExpense);
      await request(app)
        .post('/api/expenses')
        .send({ title: 'Bus ticket', amount: 2.5, category: 'Transport', date: '2025-01-16' });
      await request(app)
        .post('/api/expenses')
        .send({ title: 'Coffee', amount: 3.75, category: 'Food', date: '2025-01-17' });
    });

    it('returns all expenses', async () => {
      const res = await request(app).get('/api/expenses');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(3);
      expect(res.body.data).toHaveLength(3);
    });

    it('filters expenses by category', async () => {
      const res = await request(app).get('/api/expenses').query({ category: 'Food' });

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      res.body.data.forEach((expense) => {
        expect(expense.category).toBe('Food');
      });
    });

    it('is case-insensitive when filtering by category', async () => {
      const res = await request(app).get('/api/expenses').query({ category: 'food' });

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
    });

    it('returns an empty list for a category with no expenses', async () => {
      const res = await request(app).get('/api/expenses').query({ category: 'Travel' });

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/expenses/total', () => {
    beforeEach(async () => {
      await request(app).post('/api/expenses').send({ ...validExpense, amount: 100 });
      await request(app)
        .post('/api/expenses')
        .send({ title: 'Bus ticket', amount: 25, category: 'Transport', date: '2025-01-16' });
      await request(app)
        .post('/api/expenses')
        .send({ title: 'Coffee', amount: 10, category: 'Food', date: '2025-01-17' });
    });

    it('returns the total of all expenses', async () => {
      const res = await request(app).get('/api/expenses/total');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ total: 135 });
    });

    it('returns the total filtered by category', async () => {
      const res = await request(app).get('/api/expenses/total').query({ category: 'Food' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ total: 110 });
    });

    it('returns 0 total when there are no expenses', async () => {
      // Clear expenses again for this specific test
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');

      const res = await request(app).get('/api/expenses/total');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ total: 0 });
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    it('deletes an existing expense', async () => {
      const createRes = await request(app).post('/api/expenses').send(validExpense);
      const { id } = createRes.body.data;

      const deleteRes = await request(app).delete(`/api/expenses/${id}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
      expect(deleteRes.body.data.id).toBe(id);

      const getRes = await request(app).get('/api/expenses');
      expect(getRes.body.data.find((e) => e.id === id)).toBeUndefined();
    });

    it('returns 404 when deleting a non-existent expense', async () => {
      const res = await request(app).delete('/api/expenses/non-existent-id');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Unknown routes', () => {
    it('returns 404 for an unknown route', async () => {
      const res = await request(app).get('/api/unknown-route');
      expect(res.status).toBe(404);
    });
  });
});