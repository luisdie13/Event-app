# Testing Documentation - Event Platform

## 📋 Overview

This document provides comprehensive information about the testing setup for the Event Platform backend API. The testing infrastructure follows the requirements from the project specifications, ensuring minimum 80% code coverage.

## 🎯 Testing Requirements

According to the project specifications:

1. **Code Coverage**: Minimum 80% across all metrics (statements, branches, functions, lines)
2. **Unit Tests**: Isolated testing of business logic (services, controllers)
3. **Integration Tests**: Full request-to-response flow testing with real database
4. **Security Tests**: Validation of authentication and authorization
5. **CI/CD**: Automated testing on every push/pull request via GitHub Actions

## 🛠️ Technology Stack

- **Jest**: Testing framework (v29.7.0)
- **Supertest**: HTTP integration testing (v6.3.3)
- **PostgreSQL**: Real database for integration tests
- **GitHub Actions**: CI/CD pipeline

## 📁 Project Structure

```
backend/
├── tests/
│   ├── setup.js                          # Global test configuration
│   ├── testDb.js                         # Test database utilities
│   ├── unit/
│   │   └── authController.test.js        # Unit tests for auth
│   └── integration/
│       ├── auth.integration.test.js      # Integration tests for auth
│       ├── events.integration.test.js    # Integration tests for events
│       └── orders.integration.test.js    # Integration tests for orders
├── jest.config.js                        # Jest configuration
├── .env.test                             # Test environment variables
└── TESTING.md                            # This file
```

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install:
- `jest@^29.7.0`
- `@jest/globals@^29.7.0`
- `supertest@^6.3.3`

### 2. Setup Test Database

Create a test database in PostgreSQL:

```bash
# Using Docker (recommended)
docker-compose up -d

# Create test database
docker exec -i postgres_db psql -U postgres -c "CREATE DATABASE eventplatform_test;"

# Initialize test database schema
docker exec -i postgres_db psql -U postgres -d eventplatform_test < database/init.sql
```

Or manually:

```bash
# Create database
psql -U postgres -c "CREATE DATABASE eventplatform_test;"

# Initialize schema
psql -U postgres -d eventplatform_test -f ../database/init.sql
```

### 3. Configure Environment

Create a `.env.test` file with your test database configuration:

```env
NODE_ENV=test
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_TEST_NAME=eventplatform_test
JWT_SECRET=your_test_jwt_secret
```

## 🚀 Running Tests

### Run All Tests

```bash
npm test
```

### Run Unit Tests Only

```bash
npm run test:unit
```

### Run Integration Tests Only

```bash
npm run test:integration
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

## 📊 Test Coverage

The project enforces minimum 80% coverage across:
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

Coverage configuration is in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

### View Coverage Report

After running `npm run test:coverage`, open:

```
backend/coverage/lcov-report/index.html
```

## 🧪 Test Categories

### Unit Tests

**Purpose**: Test isolated business logic without external dependencies

**Location**: `tests/unit/`

**Example - Auth Controller Tests**:
- ✅ User registration with valid data
- ✅ Registration with missing fields (validation)
- ✅ Registration with existing email (409 conflict)
- ✅ User login with valid credentials
- ✅ Login with invalid credentials (401 unauthorized)
- ✅ Password hashing verification
- ✅ Error handling for database failures

### Integration Tests

**Purpose**: Test complete request-response flow with real database

**Location**: `tests/integration/`

**Auth Integration Tests** (`auth.integration.test.js`):
- ✅ POST /api/auth/register - User creation in DB
- ✅ POST /api/auth/login - Authentication flow
- ✅ Password not exposed in responses
- ✅ Database verification of created users

**Events Integration Tests** (`events.integration.test.js`):
- ✅ GET /api/events/featured - Featured events retrieval
- ✅ GET /api/events - Event listing with pagination
- ✅ POST /api/admin/events - Event creation (admin only)
- ✅ PUT /api/admin/events/:id - Event updates
- ✅ DELETE /api/admin/events/:id - Event deletion
- ✅ 401 responses without token
- ✅ 403 responses for non-admin users

**Orders Integration Tests** (`orders.integration.test.js`):
- ✅ POST /api/orders - Ticket purchase
- ✅ Capacity decrementing verification
- ✅ GET /api/orders/my-tickets - User ticket retrieval
- ✅ Multiple purchases capacity handling
- ✅ Validation for exceeding capacity
- ✅ Authentication requirements

## 🔒 Security Testing

All integration tests verify:

1. **Authentication**: Endpoints require valid JWT tokens (401 if missing)
2. **Authorization**: Role-based access control (403 for unauthorized roles)
3. **Password Security**: Passwords are hashed, never exposed in responses
4. **Input Validation**: Proper error codes for invalid/missing data

## 🔧 Test Database Utilities

`testDb.js` provides helper functions:

```javascript
// Setup clean test database
await setupTestDb();

// Create test user
const user = await createTestUser('Name', 'email@test.com', hashedPassword, roleId);

// Create test event
const event = await createTestEvent({ title: 'Test', capacity: 100 });

// Cleanup after tests
await teardownTestDb();
```

## 🤖 GitHub Actions CI/CD

The workflow (`.github/workflows/test.yml`) runs on:
- Push to `main` or `feature/*` branches
- Pull requests to `main`

**Workflow Steps**:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Setup PostgreSQL service
5. Initialize test database
6. Execute tests with coverage
7. Display coverage explanation

## 📝 Writing New Tests

### Unit Test Template

```javascript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { yourFunction } from '../../controllers/yourController.js';

describe('Your Controller - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  it('should do something', async () => {
    // Arrange
    req.body = { data: 'test' };

    // Act
    await yourFunction(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
```

### Integration Test Template

```javascript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { setupTestDb, teardownTestDb, testPool } from '../testDb.js';

const app = express();
app.use(express.json());
// Add your routes

describe('Your Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await testPool.query('TRUNCATE TABLE your_table RESTART IDENTITY CASCADE');
  });

  it('should test endpoint', async () => {
    const response = await request(app)
      .post('/api/your-endpoint')
      .send({ data: 'test' });

    expect(response.status).toBe(200);
    
    // Verify in database
    const dbResult = await testPool.query('SELECT * FROM your_table');
    expect(dbResult.rows).toHaveLength(1);
  });
});
```

## 🐛 Troubleshooting

### Tests fail with "database does not exist"

```bash
# Recreate test database
docker exec -i postgres_db psql -U postgres -c "DROP DATABASE IF EXISTS eventplatform_test;"
docker exec -i postgres_db psql -U postgres -c "CREATE DATABASE eventplatform_test;"
docker exec -i postgres_db psql -U postgres -d eventplatform_test < database/init.sql
```

### Tests timeout

Increase timeout in `jest.config.js`:

```javascript
testTimeout: 15000 // 15 seconds
```

### Coverage below 80%

1. Run `npm run test:coverage`
2. Open `coverage/lcov-report/index.html`
3. Identify uncovered lines
4. Add tests for uncovered code paths

### Jest ES Modules issues

Ensure package.json has:
```json
"type": "module"
```

## 📚 Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean database between tests
3. **Real DB**: Use actual PostgreSQL, not mocks, for integration tests
4. **Assertions**: Verify both response AND database state
5. **Security**: Test authentication and authorization paths
6. **Edge Cases**: Test error conditions, not just happy paths
7. **Descriptive Names**: Use clear, descriptive test names

## 🎓 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## ✅ Checklist Before Submitting

- [ ] All tests pass locally
- [ ] Coverage meets 80% minimum
- [ ] Integration tests use real database
- [ ] Security tests validate auth/authorization
- [ ] Tests are documented
- [ ] GitHub Actions workflow succeeds
- [ ] Environment variables properly configured
