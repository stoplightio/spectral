import type * as JestMock from 'jest-mock';

declare const globalThis: Global & {
  jest: typeof JestMock;
  expect: jest.Expect;
  test: jest.It;
};

globalThis.jest = require('jest-mock');
globalThis.expect = require('expect');
globalThis.test = it;
globalThis.test.concurrent = it;

// @ts-ignore
test.each = input => (name: string, fn: Function) => {
  // very simple stub-like implementation needed by src/rulesets/oas/__tests__/valid-example.ts and src/rulesets/__tests__/validation.test.ts
  for (const value of input) {
    it(name, () => {
      if (Array.isArray(value) && fn.length !== 1) {
        return fn(...value);
      } else {
        return fn(value);
      }
    });
  }
};

// @ts-ignore
describe.each = input => (name: string, fn: Function) => {
  for (const value of input) {
    describe(name, () => {
      if (Array.isArray(value) && fn.length !== 1) {
        return fn(...value);
      } else {
        return fn(value);
      }
    });
  }
};
