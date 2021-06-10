module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'js'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/__tests__/*.(ts)'],
  testPathIgnorePatterns: ['/node_modules/', '.karma.test.ts$'],
  coveragePathIgnorePatterns: ['<rootDir>/dist/', '/node_modules/'],
  setupFilesAfterEnv: ['./setupJest.ts'],
  globalSetup: './setupJest.global.ts',
  moduleNameMapper: {
    '^@stoplight/spectral-test-utils': '<rootDir>/test-utils/node/index.ts',
  },
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
