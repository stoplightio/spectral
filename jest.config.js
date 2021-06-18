module.exports = {
  projects: ['<rootDir>/packages/'],
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'js'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./setupJest.ts'],
  moduleNameMapper: {
    '^@stoplight/spectral-core': '<rootDir>/packages/core/src/index.ts',
    '^@stoplight/spectral-functions': '<rootDir>/packages/functions/src/index.ts',
    '^@stoplight/spectral-formats': '<rootDir>/packages/formats/src/index.ts',
    '^@stoplight/spectral-utils': '<rootDir>/src/utils/index.ts',
    '^@stoplight/spectral-parsers': '<rootDir>/packages/parsers/src/index.ts',
    '^@stoplight/spectral-ref-resolver': '<rootDir>/packages/ref-resolver/src/index.ts',
    '^@stoplight/spectral-io': '<rootDir>/packages/io/src/index.ts',
    '^@stoplight/spectral-test-utils': '<rootDir>/test-utils/node/index.ts',
  },
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
