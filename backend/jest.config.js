export default {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'database/**/*.js',
    'middleware/**/*.js',
    '!database/db.js', // Exclude DB connection file
    '!database/eventQueries.js', // Exclude complex legacy queries
    '!controllers/eventController.js', // Exclude legacy controller
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
