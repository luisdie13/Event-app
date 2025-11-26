// tests/integration/orders.integration.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import orderRoutes from '../../routes/orderRoutes.js';
import authRoutes from '../../routes/authRoutes.js';
import { setupTestDb, teardownTestDb, testPool, createTestEvent, createTestUser } from '../testDb.js';
import jwt from 'jsonwebtoken';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

describe('Orders Integration Tests', () => {
  let userToken;
  let user;
  let event;

  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    // Clean up test data (pool will be closed by global teardown)
    await testPool.query('TRUNCATE TABLE tickets, images, events, categories, users, roles RESTART IDENTITY CASCADE');
  });

  beforeEach(async () => {
    // Clean database before each test (preserve roles/categories)
    await testPool.query('DELETE FROM tickets');
    await testPool.query('DELETE FROM images');
    await testPool.query('DELETE FROM events');
    await testPool.query('DELETE FROM users');
    
    // Create test user
    user = await createTestUser('Test User', 'user@example.com', '$2b$10$test', 2);
    userToken = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id },
      process.env.JWT_SECRET || 'mi_secreto_super_seguro_y_largo_debes_cambiarlo',
      { expiresIn: '1h' }
    );

    // Create test event
    event = await createTestEvent({
      title: 'Test Concert',
      total_tickets: 100,
      available_tickets: 100,
      price: 50.00
    });
  });

  describe('POST /api/orders - Purchase Tickets', () => {
    it('should create ticket purchase and return 201', async () => {
      const purchaseData = {
        event_id: event.id,
        quantity: 2
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(purchaseData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('ticket');
      expect(response.body.ticket.quantity).toBe(2);
      expect(response.body.ticket.event_id).toBe(event.id);

      // Verify ticket was created in database
      const ticketResult = await testPool.query(
        'SELECT * FROM tickets WHERE user_id = $1 AND event_id = $2',
        [user.id, event.id]
      );
      expect(ticketResult.rows).toHaveLength(1);
      expect(ticketResult.rows[0].quantity).toBe(2);

      // Verify available_tickets was decremented
      const eventResult = await testPool.query(
        'SELECT available_tickets FROM events WHERE id = $1',
        [event.id]
      );
      expect(eventResult.rows[0].available_tickets).toBe(98); // 100 - 2
    });

    it('should return 401 without authentication', async () => {
      const purchaseData = {
        event_id: event.id,
        quantity: 1
      };

      const response = await request(app)
        .post('/api/orders')
        .send(purchaseData);

      expect(response.status).toBe(401);
    });

    it('should return 400 if quantity exceeds available capacity', async () => {
      const purchaseData = {
        event_id: event.id,
        quantity: 150 // More than capacity of 100
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(purchaseData);

      expect(response.status).toBe(400);
      
      // Verify available_tickets was NOT decremented
      const eventResult = await testPool.query(
        'SELECT available_tickets FROM events WHERE id = $1',
        [event.id]
      );
      expect(eventResult.rows[0].available_tickets).toBe(100);
    });

    it('should return 400 if quantity is less than 1', async () => {
      const purchaseData = {
        event_id: event.id,
        quantity: 0
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(purchaseData);

      expect(response.status).toBe(400);
    });

    it('should handle multiple purchases reducing capacity correctly', async () => {
      // First purchase
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ event_id: event.id, quantity: 30 });

      // Second purchase
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ event_id: event.id, quantity: 20 });

      // Verify final available_tickets
      const eventResult = await testPool.query(
        'SELECT available_tickets FROM events WHERE id = $1',
        [event.id]
      );
      expect(eventResult.rows[0].available_tickets).toBe(50); // 100 - 30 - 20
    });

    it('should return 404 for non-existent event', async () => {
      const purchaseData = {
        event_id: 99999,
        quantity: 1
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(purchaseData);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/orders/my-tickets - Get User Tickets', () => {
    beforeEach(async () => {
      // Create some tickets for the user
      await testPool.query(
        'INSERT INTO tickets (user_id, event_id, quantity, purchase_date, total_price) VALUES ($1, $2, $3, NOW(), $4)',
        [user.id, event.id, 2, 100.00]
      );
    });

    it('should return user tickets with authentication', async () => {
      const response = await request(app)
        .get('/api/orders/my-tickets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('quantity', 2);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/orders/my-tickets');

      expect(response.status).toBe(401);
    });

    it('should return empty array if user has no tickets', async () => {
      // Create a new user with no tickets
      const newUser = await createTestUser('New User', 'newuser@example.com', '$2b$10$test', 2);
      const newUserToken = jwt.sign(
        { id: newUser.id, email: newUser.email, role_id: newUser.role_id },
        process.env.JWT_SECRET || 'mi_secreto_super_seguro_y_largo_debes_cambiarlo',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/orders/my-tickets')
        .set('Authorization', `Bearer ${newUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});
