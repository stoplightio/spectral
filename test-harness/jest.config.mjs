import * as process from 'node:process';

export default {
  transform: {
    '^.+\\.(t|j)s$': ['@swc/jest'],
  },
  moduleNameMapper: {
    '^@stoplight/spectral-test-harness$':
      process.platform === 'win32' ? '<rootDir>/src/runtime/win.ts' : '<rootDir>/src/runtime/nix.ts',
  },
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testTimeout: 15_000,
};
