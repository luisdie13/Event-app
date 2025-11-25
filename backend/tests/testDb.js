// tests/testDb.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create a separate test database pool
export const testPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_TEST_NAME || 'eventplatform_test',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Setup test database
export const setupTestDb = async () => {
  try {
    // Clean up existing data in proper order (respecting foreign keys)
    await testPool.query('DELETE FROM tickets');
    await testPool.query('DELETE FROM images');
    await testPool.query('DELETE FROM events');
    await testPool.query('DELETE FROM users');
    await testPool.query('DELETE FROM categories');
    await testPool.query('DELETE FROM roles');
    
    // Re-insert roles
    await testPool.query(`
      INSERT INTO roles (id, name) VALUES 
      (1, 'guest'),
      (2, 'member'),
      (3, 'organizer'),
      (4, 'moderator'),
      (5, 'administrator')
    `);
    
    // Re-insert categories
    await testPool.query(`
      INSERT INTO categories (id, name, slug) VALUES 
      (1, 'Música', 'musica'),
      (2, 'Deportes', 'deportes'),
      (3, 'Tecnología', 'tecnologia'),
      (4, 'Arte', 'arte'),
      (5, 'Educación', 'educacion'),
      (6, 'Negocios', 'negocios')
    `);
    
    console.log('✅ Test database setup completed');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
};

// Cleanup test database
export const teardownTestDb = async () => {
  try {
    await testPool.query('TRUNCATE TABLE tickets, images, events, categories, users, roles RESTART IDENTITY CASCADE');
    await testPool.end();
    console.log('✅ Test database cleaned up');
  } catch (error) {
    console.error('Error tearing down test database:', error);
    throw error;
  }
};

// Helper to create a test user
export const createTestUser = async (name = 'Test User', email = 'test@example.com', password_hash = '$2b$10$test', role_id = 2) => {
  const result = await testPool.query(
    'INSERT INTO users (name, email, password_hash, role_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, password_hash, role_id]
  );
  return result.rows[0];
};

// Helper to create a test event
export const createTestEvent = async (eventData = {}) => {
  // First, get or create a test user to be the event owner
  const userResult = await testPool.query(
    `SELECT id FROM users LIMIT 1`
  );
  
  let user_id;
  if (userResult.rows.length === 0) {
    const newUser = await createTestUser('Event Owner', 'owner@test.com', '$2b$10$test', 2);
    user_id = newUser.id;
  } else {
    user_id = userResult.rows[0].id;
  }

  const {
    title = 'Test Event',
    slug = 'test-event-' + Date.now(),
    description = 'Test Description',
    date_time = new Date(Date.now() + 86400000).toISOString(),
    location = 'Test Location',
    category_id = 1,
    total_tickets = 100,
    available_tickets = 100,
    price = 50.00,
    is_featured = false
  } = eventData;

  const result = await testPool.query(
    `INSERT INTO events (user_id, title, slug, description, date_time, location, category_id, total_tickets, available_tickets, price, is_featured)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
    [user_id, title, slug, description, date_time, location, category_id, total_tickets, available_tickets, price, is_featured]
  );
  return result.rows[0];
};
