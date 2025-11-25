#!/bin/bash
# Setup script for test database

echo "🔧 Setting up test database..."

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Check if postgres container exists
if ! docker ps -a | grep -q postgres_db; then
    echo "❌ Error: postgres_db container not found. Please run 'docker-compose up -d' first."
    exit 1
fi

# Start postgres if not running
if ! docker ps | grep -q postgres_db; then
    echo "📦 Starting PostgreSQL container..."
    docker start postgres_db
    sleep 3
fi

# Drop existing test database if exists
echo "🗑️  Dropping existing test database (if exists)..."
docker exec -i postgres_db psql -U postgres -c "DROP DATABASE IF EXISTS eventplatform_test;" 2>/dev/null

# Create test database
echo "📊 Creating test database..."
docker exec -i postgres_db psql -U postgres -c "CREATE DATABASE eventplatform_test;"

# Initialize schema
echo "🏗️  Initializing database schema..."
docker exec -i postgres_db psql -U postgres -d eventplatform_test < ../database/init.sql

echo "✅ Test database setup complete!"
echo ""
echo "You can now run:"
echo "  npm test              - Run all tests"
echo "  npm run test:unit     - Run unit tests only"
echo "  npm run test:integration - Run integration tests only"
echo "  npm run test:coverage - Run tests with coverage"
