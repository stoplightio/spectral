(global as any).jest = require('jest-mock');
(global as any).expect = require('expect');
(global as any).test = it;

expect.extend({
  toMatchSnapshot: () => ({ pass: true, message: '' }),
  toMatchInlineSnapshot: () => ({ pass: true, message: '' }),
});

// @ts-ignore
test.each = input => (name: string, fn: Function) => {
  // very simple stub-like implementation needed by src/rulesets/oas3/__tests__/valid-example.ts
  for (const value of input) {
    fn(name.replace('%s', value[0]), ...value);
  }
};

beforeEach(() => {
  jest.restoreAllMocks();
});
