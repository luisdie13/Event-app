-- Database initialization script for Event Platform
-- PostgreSQL with UUID support

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1. Create roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles (ID 5 for administrator, ID 2 for member)
INSERT INTO roles (id, name) VALUES 
    (1, 'guest'),
    (2, 'member'),
    (3, 'organizer'),
    (4, 'moderator'),
    (5, 'administrator');

-- Reset sequence to continue from 6
SELECT setval('roles_id_seq', 5, true);

-- 2. Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- 3. Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
    ('Música', 'musica', 'Conciertos, festivales y eventos musicales'),
    ('Deportes', 'deportes', 'Eventos deportivos y competencias'),
    ('Tecnología', 'tecnologia', 'Conferencias, hackathons y eventos tech'),
    ('Arte', 'arte', 'Exposiciones, galerías y eventos artísticos'),
    ('Educación', 'educacion', 'Talleres, seminarios y cursos'),
    ('Negocios', 'negocios', 'Networking, conferencias empresariales');

-- 4. Create events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    date_time TIMESTAMP NOT NULL,
    location VARCHAR(255) NOT NULL,
    total_tickets INTEGER NOT NULL CHECK (total_tickets > 0),
    available_tickets INTEGER NOT NULL CHECK (available_tickets >= 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_available_tickets CHECK (available_tickets <= total_tickets)
);

-- Create indexes for better query performance
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_events_date ON events(date_time);
CREATE INDEX idx_events_featured ON events(is_featured);

-- 5. Create images table
CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster image lookups
CREATE INDEX idx_images_event ON images(event_id);
CREATE INDEX idx_images_main ON images(event_id, is_main);

-- 6. Create tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'used')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for tickets
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (password: admin123)
-- Password hash for 'admin123' with bcrypt (10 rounds)
INSERT INTO users (role_id, name, email, password_hash) VALUES
    (5, 'Administrador', 'admin@eventplatform.com', '$2b$10$rGfVQJ3YJZKZqKZqKZqKZuO7qJ3YJZKZqKZqKZqKZqKZqKZqKZqKZ.');

-- Insert sample member user (password: member123)
INSERT INTO users (role_id, name, email, password_hash) VALUES
    (2, 'Usuario Demo', 'user@eventplatform.com', '$2b$10$rGfVQJ3YJZKZqKZqKZqKZuO7qJ3YJZKZqKZqKZqKZqKZqKZqKZqKZ.');

-- Note: The password hashes above are placeholders. 
-- In production, you should generate real bcrypt hashes or let users register through the app.

COMMENT ON TABLE roles IS 'User roles for authorization';
COMMENT ON TABLE users IS 'Platform users with authentication';
COMMENT ON TABLE categories IS 'Event categories for organization';
COMMENT ON TABLE events IS 'Main events table';
COMMENT ON TABLE images IS 'Event images with main image flag';
COMMENT ON TABLE tickets IS 'User ticket purchases';
