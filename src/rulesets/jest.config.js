module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'js'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/__tests__/*.(ts)'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['./setupJest.ts'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
