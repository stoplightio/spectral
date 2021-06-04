jest.mock('fs');
jest.mock('./__tests__/__helpers__/setup-mocks/index.ts', () =>
  jest.requireActual('./__tests__/__helpers__/setup-mocks/node.ts'),
);
