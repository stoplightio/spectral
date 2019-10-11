import * as fs from 'fs';

let readFileSpy: jest.SpyInstance;
let accessSpy: jest.SpyInstance;

const { readFile, access } = fs;

jest.setTimeout(10 * 1000);

beforeEach(() => {
  readFileSpy = jest.spyOn(fs, 'readFile');
  accessSpy = jest.spyOn(fs, 'access');

  accessSpy.mockImplementation((path, type, cb) => {
    return access(
      path.replace(/(src)\/(rulesets\/oas\d?\/(?!__tests__))/, (str: string, val: string, p: string) => `dist/${p}`),
      type,
      cb,
    );
  });

  readFileSpy.mockImplementation((path, encoding, cb) => {
    return readFile(
      path.replace(/(src)\/(rulesets\/oas\d?\/(?!__tests__))/, (str: string, val: string, p: string) => `dist/${p}`),
      encoding,
      cb,
    );
  });
});

afterEach(() => {
  readFileSpy.mockRestore();
  accessSpy.mockRestore();
});

jest.mock('fs');
