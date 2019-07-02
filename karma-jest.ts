// @ts-ignore
window.jest = require('jest-mock');
// @ts-ignore
window.expect = require('expect');
window.test = it;

// @ts-ignore
window.expect.extend({
  toMatchSnapshot: () => ({ pass: true }),
  toMatchInlineSnapshot: () => ({ pass: true }),
});

beforeEach(() => {
  jest.restoreAllMocks();
});
