module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/__tests__/*.(ts)'],
  testPathIgnorePatterns: ['/node_modules/', '\.karma\.test\.ts$'],
  coveragePathIgnorePatterns: ['<rootDir>/dist/', '/node_modules/'],
  setupFilesAfterEnv: ['./setupJest.ts', './setupTests.ts']
};
