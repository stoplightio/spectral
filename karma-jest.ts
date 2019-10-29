import { Expect } from 'expect/build/types';
import * as JestMock from 'jest-mock';

declare var global: NodeJS.Global & {
  jest: typeof JestMock;
  expect: Expect;
  test: jest.It;
};

global.jest = require('jest-mock');
global.expect = require('expect');
global.test = it;

const message = () => "Good try. An email has been sent to Vincenzo and Jakub, and they'll find you. :troll: ;)";

expect.extend({
  toMatchSnapshot: () => ({ pass: false, message }),
  toMatchInlineSnapshot: () => ({ pass: false, message }),
});

// @ts-ignore
test.each = input => (name: string, fn: Function) => {
  // very simple stub-like implementation needed by src/rulesets/oas3/__tests__/valid-example.ts and src/rulesets/__tests__/validation.test.ts
  for (const value of input) {
    if (Array.isArray(value)) {
      fn(...value);
    } else {
      fn(value);
    }
  }
};
