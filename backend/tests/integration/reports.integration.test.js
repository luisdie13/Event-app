// tests/integration/reports.integration.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import adminRoutes from '../../routes/adminRoutes.js';
import { setupTestDb, testPool, createTestUser, createTestEvent } from '../testDb.js';
import jwt from 'jsonwebtoken';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

describe('Reports Integration Tests', () => {
  let adminToken;
  let adminUser;
  let user1;
  let user2;
  let event1;
  let event2;

  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    // Clean up test data (pool will be closed by global teardown)
    await testPool.query('TRUNCATE TABLE tickets, images, events, categories, users, roles RESTART IDENTITY CASCADE');
  });

  beforeEach(async () => {
    // Clean database before each test
    await testPool.query('DELETE FROM tickets');
    await testPool.query('DELETE FROM images');
    await testPool.query('DELETE FROM events');
    await testPool.query('DELETE FROM users');
    
    // Create admin user
    adminUser = await createTestUser('Admin User', 'admin@example.com', '$2b$10$test', 5);
    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role_id: adminUser.role_id },
      process.env.JWT_SECRET || 'mi_secreto_super_seguro_y_largo_debes_cambiarlo',
      { expiresIn: '1h' }
    );

    // Create regular users
    user1 = await createTestUser('User 1', 'user1@example.com', '$2b$10$test', 2);
    user2 = await createTestUser('User 2', 'user2@example.com', '$2b$10$test', 2);

    // Create events
    event1 = await createTestEvent({
      title: 'Concert Event',
      category_id: 1,
      price: 100.00,
      total_tickets: 200,
      available_tickets: 200
    });

    event2 = await createTestEvent({
      title: 'Sports Event',
      category_id: 2,
      price: 50.00,
      total_tickets: 100,
      available_tickets: 100
    });
  });

  describe('GET /api/admin/reports', () => {
    it('should return empty reports when no tickets sold', async () => {
      const response = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sales');
      expect(response.body.sales.total_sales).toBe(0);
      expect(response.body.sales.total_tickets_sold).toBe(0);
      expect(response.body.attendees.total_attendees).toBe(0);
      expect(response.body).toHaveProperty('top_events');
      expect(response.body).toHaveProperty('by_category');
      expect(response.body).toHaveProperty('statistics');
    });

    it('should return correct sales data with tickets', async () => {
      // Create tickets for user1
      await testPool.query(
        `INSERT INTO tickets (user_id, event_id, quantity, purchase_date, total_price, status) 
         VALUES ($1, $2, $3, NOW(), $4, 'active')`,
        [user1.id, event1.id, 2, 200.00]
      );

      // Create tickets for user2
      await testPool.query(
        `INSERT INTO tickets (user_id, event_id, quantity, purchase_date, total_price, status) 
         VALUES ($1, $2, $3, NOW(), $4, 'active')`,
        [user2.id, event2.id, 3, 150.00]
      );

      const response = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sales.total_sales).toBe(350.00); // 200 + 150
      expect(response.body.sales.total_tickets_sold).toBe(5); // 2 + 3
      expect(response.body.attendees.total_attendees).toBe(2); // user1 and user2
    });

    it('should return top events by revenue', async () => {
      // Create tickets
      await testPool.query(
        `INSERT INTO tickets (user_id, event_id, quantity, purchase_date, total_price, status) 
         VALUES ($1, $2, $3, NOW(), $4, 'active')`,
        [user1.id, event1.id, 5, 500.00]
      );

      await testPool.query(
        `INSERT INTO tickets (user_id, event_id, quantity, purchase_date, total_price, status) 
         VALUES ($1, $2, $3, NOW(), $4, 'active')`,
        [user2.id, event2.id, 2, 100.00]
      );

      const response = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.top_events).toBeInstanceOf(Array);
      expect(response.body.top_events.length).toBeGreaterThan(0);
      
      // First event should have highest revenue
      expect(response.body.top_events[0].revenue).toBeGreaterThanOrEqual(response.body.top_events[1].revenue);
    });

    it('should return sales by category', async () => {
      // Create tickets for different categories
      await testPool.query(
        `INSERT INTO tickets (user_id, event_id, quantity, purchase_date, total_price, status) 
         VALUES ($1, $2, $3, NOW(), $4, 'active')`,
        [user1.id, event1.id, 3, 300.00] // Category 1 (Música)
      );

      await testPool.query(
        `INSERT INTO tickets (user_id, event_id, quantity, purchase_date, total_price, status) 
         VALUES ($1, $2, $3, NOW(), $4, 'active')`,
        [user2.id, event2.id, 2, 100.00] // Category 2 (Deportes)
      );

      const response = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.by_category).toBeInstanceOf(Array);
      expect(response.body.by_category.length).toBeGreaterThan(0);
      
      // Find Música category
      const musicCategory = response.body.by_category.find(cat => cat.category_name === 'Música');
      expect(musicCategory).toBeDefined();
      expect(musicCategory.tickets_sold).toBe(3);
      expect(musicCategory.revenue).toBe(300.00);
    });

    it('should return correct statistics', async () => {
      const response = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.statistics).toHaveProperty('total_members');
      expect(response.body.statistics).toHaveProperty('upcoming_events');
      expect(response.body.statistics).toHaveProperty('past_events');
      expect(response.body.statistics).toHaveProperty('total_events');
      
      expect(response.body.statistics.total_members).toBe(2); // user1 and user2
      expect(response.body.statistics.total_events).toBe(2); // event1 and event2
    });

    it('should ignore cancelled tickets', async () => {
      // Create active ticket
      await testPool.query(
        `INSERT INTO tickets (user_id, event_id, quantity, purchase_date, total_price, status) 
         VALUES ($1, $2, $3, NOW(), $4, 'active')`,
        [user1.id, event1.id, 2, 200.00]
      );

      // Create cancelled ticket
      await testPool.query(
        `INSERT INTO tickets (user_id, event_id, quantity, purchase_date, total_price, status) 
         VALUES ($1, $2, $3, NOW(), $4, 'cancelled')`,
        [user2.id, event2.id, 5, 500.00]
      );

      const response = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      // Should only count active tickets
      expect(response.body.sales.total_sales).toBe(200.00);
      expect(response.body.sales.total_tickets_sold).toBe(2);
      expect(response.body.attendees.total_attendees).toBe(1); // Only user1
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/reports');

      expect(response.status).toBe(401);
    });

    it('should count unique attendees correctly', async () => {
      // User1 buys tickets for both events
      await testPool.query(
        `INSERT INTO tickets (user_id, event_id, quantity, purchase_date, total_price, status) 
         VALUES ($1, $2, $3, NOW(), $4, 'active')`,
        [user1.id, event1.id, 2, 200.00]
      );

      await testPool.query(
        `INSERT INTO tickets (user_id, event_id, quantity, purchase_date, total_price, status) 
         VALUES ($1, $2, $3, NOW(), $4, 'active')`,
        [user1.id, event2.id, 1, 50.00]
      );

      const response = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      // Should count user1 only once even though they bought tickets for 2 events
      expect(response.body.attendees.total_attendees).toBe(1);
      expect(response.body.sales.total_tickets_sold).toBe(3);
      expect(response.body.sales.total_sales).toBe(250.00);
    });
  });
});
