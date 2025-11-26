// tests/integration/auth.integration.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/authRoutes.js';
import { setupTestDb, teardownTestDb, testPool } from '../testDb.js';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    // Clean up test data (pool will be closed by global teardown)
    await testPool.query('TRUNCATE TABLE tickets, images, events, categories, users, roles RESTART IDENTITY CASCADE');
  });

  beforeEach(async () => {
    // Clean users table before each test (preserve roles/categories)
    await testPool.query('DELETE FROM tickets');
    await testPool.query('DELETE FROM images');
    await testPool.query('DELETE FROM events');
    await testPool.query('DELETE FROM users');
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201 with token', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Registro exitoso.');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', 'john@example.com');
      expect(response.body.user).toHaveProperty('name', 'John Doe');
      expect(response.body.user).toHaveProperty('role_id', 2); // Default member role
      expect(response.body.user).not.toHaveProperty('password_hash');

      // Verify user was created in database
      const dbResult = await testPool.query(
        'SELECT * FROM users WHERE email = $1',
        ['john@example.com']
      );
      expect(dbResult.rows).toHaveLength(1);
      expect(dbResult.rows[0].name).toBe('John Doe');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'john@example.com'
          // missing name and password
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Todos los campos son obligatorios.');
    });

    it('should return 409 if email already exists', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'duplicate@example.com',
          password: 'password123'
        });

      // Attempt duplicate registration
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'duplicate@example.com',
          password: 'password456'
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message', 'El email ya está registrado.');
    });

    it('should hash the password before storing', async () => {
      const plainPassword = 'mySecurePassword123';
      
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Security Test',
          email: 'security@example.com',
          password: plainPassword
        });

      // Check that password is hashed in database
      const dbResult = await testPool.query(
        'SELECT password_hash FROM users WHERE email = $1',
        ['security@example.com']
      );
      
      expect(dbResult.rows[0].password_hash).toBeDefined();
      expect(dbResult.rows[0].password_hash).not.toBe(plainPassword);
      expect(dbResult.rows[0].password_hash).toMatch(/^\$2[aby]\$/); // bcrypt format
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'password123'
        });
    });

    it('should login successfully with valid credentials and return 200', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Inicio de sesión exitoso.');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', 'testuser@example.com');
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email y contraseña son obligatorios.');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email y contraseña son obligatorios.');
    });

    it('should return 401 with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Credenciales inválidas.');
    });

    it('should return 401 with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Credenciales inválidas.');
    });

    it('should not expose password in response', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('password_hash');
    });
  });
});
