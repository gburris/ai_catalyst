/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
    },
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/src/db/migrate.js'],
}
