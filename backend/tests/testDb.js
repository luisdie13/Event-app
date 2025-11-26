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
    // Create tables if they don't exist (for CI environment)
    await testPool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      );
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL
      );
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role_id INTEGER REFERENCES roles(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        date_time TIMESTAMP NOT NULL,
        location VARCHAR(255) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        total_tickets INTEGER NOT NULL,
        available_tickets INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        url VARCHAR(500) NOT NULL,
        is_main BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await testPool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

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
    console.log('✅ Test database cleaned up');
  } catch (error) {
    console.error('Error tearing down test database:', error);
    throw error;
  }
};

// Close the pool connection (call this in global teardown)
export const closeTestPool = async () => {
  try {
    await testPool.end();
  } catch (error) {
    console.error('Error closing test pool:', error);
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
    slug = 'test-event-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
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
