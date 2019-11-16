import * as path from '@stoplight/path';
import { findFile } from '../finder';

describe('Rulesets finder', () => {
  it('should join relative path', () => {
    return expect(findFile(__dirname, './finder.jest.test.ts')).resolves.toEqual(
      path.join(__dirname, './finder.jest.test.ts'),
    );
  });

  it('should join absolute path', () => {
    return expect(findFile('a/b/c', '/d')).resolves.toEqual('/d');
  });

  it('should join http relative', () => {
    return expect(findFile('http://www.example.com/a', 'd.json')).resolves.toEqual('http://www.example.com/a/d.json');
  });

  it('should resolve http absolute', () => {
    return expect(findFile('http://www.example.com/a/b.json', 'http://www.acme.com/b.json')).resolves.toEqual(
      'http://www.acme.com/b.json',
    );
  });

  it('should support spectral built-in rules', () => {
    return expect(findFile('/b/c/d', '@stoplight/spectral/rulesets/oas/index.json')).resolves.toEqual(
      path.join(process.cwd(), 'src/rulesets/oas/index.json'),
    );
  });

  it('should support spectral built-in ruleset shorthand', () => {
    return expect(findFile('', `spectral:oas`)).resolves.toEqual(
      path.join(process.cwd(), `src/rulesets/oas/index.json`),
    );
  });

  it('should resolve spectral built-in ruleset shorthand even if a base uri is provided', () => {
    return expect(findFile('https://localhost:4000', `spectral:oas`)).resolves.toEqual(
      path.join(process.cwd(), `src/rulesets/oas/index.json`),
    );
  });

  it('should load local npm module if available', () => {
    return expect(findFile('', '@stoplight/json')).resolves.toEqual(require.resolve('@stoplight/json'));
  });

  it('should point to unpkg.com if npm module if unavailable', () => {
    return expect(findFile('', '@stoplight/foo-bar')).resolves.toEqual('https://unpkg.com/@stoplight/foo-bar');
  });
});
