// tests/integration/categories.integration.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import categoryRoutes from '../../routes/categoryRoutes.js';
import { setupTestDb, testPool } from '../testDb.js';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/categories', categoryRoutes);

describe('Categories Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    // Clean up test data (pool will be closed by global teardown)
    await testPool.query('TRUNCATE TABLE tickets, images, events, categories, users, roles RESTART IDENTITY CASCADE');
  });

  beforeEach(async () => {
    // Clean and re-insert categories before each test
    await testPool.query('DELETE FROM categories');
    await testPool.query(`
      INSERT INTO categories (id, name, slug) VALUES 
      (1, 'Música', 'musica'),
      (2, 'Deportes', 'deportes'),
      (3, 'Tecnología', 'tecnologia'),
      (4, 'Arte', 'arte'),
      (5, 'Educación', 'educacion'),
      (6, 'Negocios', 'negocios')
    `);
  });

  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      const response = await request(app)
        .get('/api/categories');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(6);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('slug');
    });

    it('should return empty array when no categories exist', async () => {
      // Delete all categories
      await testPool.query('DELETE FROM categories');

      const response = await request(app)
        .get('/api/categories');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return categories with correct structure', async () => {
      const response = await request(app)
        .get('/api/categories');

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('slug');
    });
  });
});
