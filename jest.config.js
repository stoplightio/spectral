module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/__tests__/*.(ts)'],
  displayName: {
    color: 'blue',
    name: 'Spectral Core',
  },
  projects: [
    '<rootDir>',
    {
      preset: '@stoplight/scripts',
      displayName: {
        color: 'red',
        name: 'Spectral Electron',
      },
      testPathIgnorePatterns: [ '/node_modules/', '<rootDir>/src/cli/'],
      runner: '@jest-runner/electron',
      testEnvironment: '@jest-runner/electron/environment',
    },
    {
      preset: '@stoplight/scripts',
      displayName: {
        name: 'Spectral CLI',
        color: 'grey',
      },
      testMatch: ["<rootDir>/src/cli/**/__tests__/**/*.[jt]s?(x)"]
    }
  ],
};
