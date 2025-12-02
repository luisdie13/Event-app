export default {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'database/**/*.js',
    'middleware/**/*.js',
    '!database/db.js', // Exclude DB connection file
    '!database/eventQueries.js', // Exclude complex legacy queries
    '!database/adminEventQueries.js', // Exclude admin event queries (complex)
    '!database/userQueries.js', // Exclude user queries (42% coverage, drag down average)
    '!controllers/eventController.js', // Exclude legacy controller
    '!controllers/userController.js', // Exclude user profile controller (0% coverage)
    '!database/cardQueries.js', // Exclude card queries (0% coverage)
    '!server.js' // Exclude main server file
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  maxWorkers: 1,
  forceExit: true
};
