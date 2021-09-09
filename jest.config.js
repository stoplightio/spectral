/*eslint-env node*/
const { pathsToModuleNameMapper } = require('ts-jest/utils');
const path = require('path');
const { mapValues } = require('lodash');
const { compilerOptions } = require('./tsconfig.json');

const projectDefault = {
  preset: 'ts-jest',
  moduleNameMapper: {
    ...mapValues(pathsToModuleNameMapper(compilerOptions.paths), v => path.join(__dirname, v)),
    '^@stoplight/spectral-test-utils$': '<rootDir>/test-utils/node/index.ts',
    '^nimma/fallbacks$': '<rootDir>/node_modules/nimma/dist/cjs/fallbacks/index.js',
    '^nimma/legacy$': '<rootDir>/node_modules/nimma/dist/legacy/cjs/index.js',
  },
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      useIsolatedModules: true,
    },
  },
};

module.exports = {
  projects: [
    {
      ...projectDefault,
      displayName: {
        name: '@stoplight/spectral-cli',
        color: 'greenBright',
      },
      testMatch: ['<rootDir>/packages/cli/src/**/__tests__/**/*.{test,spec}.ts'],
    },
    {
      ...projectDefault,
      displayName: {
        name: '@stoplight/spectral-core',
        color: 'magenta',
      },
      testMatch: ['<rootDir>/packages/core/src/**/__tests__/**/*.{test,spec}.ts'],
    },
    {
      ...projectDefault,
      displayName: {
        name: '@stoplight/spectral-formats',
        color: 'redBright',
      },
      testMatch: ['<rootDir>/packages/formats/src/**/__tests__/**/*.{test,spec}.ts'],
    },
    {
      ...projectDefault,
      displayName: {
        name: '@stoplight/spectral-functions',
        color: 'blueBright',
      },
      testMatch: ['<rootDir>/packages/functions/src/**/__tests__/**/*.{test,spec}.ts'],
    },
    {
      ...projectDefault,
      displayName: {
        name: '@stoplight/spectral-ruleset-migrator',
        color: 'blueBright',
      },
      testMatch: ['<rootDir>/packages/ruleset-migrator/src/**/__tests__/**/*.{test,spec}.ts'],
    },
    {
      ...projectDefault,
      displayName: '@stoplight/spectral-parsers',
      testMatch: ['<rootDir>/packages/parsers/src/**/__tests__/**/*.{test,spec}.ts'],
    },
    {
      ...projectDefault,
      displayName: {
        name: '@stoplight/spectral-ref-resolver',
        color: 'yellow',
      },
      testMatch: ['<rootDir>/packages/ref-resolver/src/**/__tests__/**/*.{test,spec}.ts'],
    },
    {
      ...projectDefault,
      displayName: {
        name: '@stoplight/spectral-rulesets',
        color: 'cyanBright',
      },
      testMatch: ['<rootDir>/packages/rulesets/src/**/__tests__/**/*.{test,spec}.ts'],
    },
    {
      ...projectDefault,
      displayName: {
        name: '@stoplight/spectral-runtime',
        color: 'blue',
      },
      testMatch: ['<rootDir>/packages/runtime/src/**/__tests__/*.{test,spec}.ts'],
    },
  ],
  collectCoverageFrom: ['<rootDir>/packages/*/src/**/*.ts', '!<rootDir>/packages/*/src/**/__*__/**/*.ts'],
};
