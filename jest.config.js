module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/bot.ts',
    '!src/master_bot.ts',
    '!src/city_hall_bot.ts',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  globalTeardown: '<rootDir>/tests/teardown.ts',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
