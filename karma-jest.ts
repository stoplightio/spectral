// @ts-ignore
window.jest = require('jest-mock');
// @ts-ignore
window.expect = require('expect');
window.test = it;

beforeEach(() => {
  jest.restoreAllMocks();
});
