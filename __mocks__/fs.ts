const fs = jest.requireActual('fs');

module.exports = {
  ...fs,
  writeFile: jest.fn((source: unknown, opts: unknown, cb: Function) => cb(null)),
};
