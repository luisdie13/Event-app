// tests/setup.js
import { jest } from '@jest/globals';
import { closeTestPool } from './testDb.js';

// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'mi_secreto_super_seguro_y_largo_debes_cambiarlo';
});

afterAll(async () => {
  // Close database pool to prevent Jest from hanging
  await closeTestPool();
});

// Increase timeout for integration tests
jest.setTimeout(10000);
