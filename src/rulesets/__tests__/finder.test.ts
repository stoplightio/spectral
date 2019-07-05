import * as path from '@stoplight/path';
import { findRuleset } from '../finder';

// @oclif/test packages requires @types/mocha, therefore we have 2 packages coming up with similar typings
// TS is confused and prefers the mocha ones, so we need to instrument it to pick up the Jest ones
declare var it: jest.It;

describe('Rulesets finder', () => {
  it('should join relative path', () => {
    return expect(findRuleset(__filename, './finder.test.ts')).resolves.toEqual(
      path.join(__dirname, './finder.test.ts'),
    );
  });

  it('should join absolute path', () => {
    return expect(findRuleset('a/b/c', '/d')).resolves.toEqual('/d');
  });

  it('should join http relative', () => {
    return expect(findRuleset('http://www.example.com/a/b.json', 'd.json')).resolves.toEqual(
      'http://www.example.com/a/d.json',
    );
  });

  it('should resolve http absolute', () => {
    return expect(findRuleset('http://www.example.com/a/b.json', 'http://www.acme.com/b.json')).resolves.toEqual(
      'http://www.acme.com/b.json',
    );
  });

  it('should support spectral built-in rules', () => {
    return expect(findRuleset('/b/c/d', '@stoplight/spectral/rulesets/oas2/index.json')).resolves.toEqual(
      path.join(process.cwd(), 'src/rulesets/oas2/index.json'),
    );
  });

  it.each(['oas', 'oas2', 'oas3'])('should support spectral built-in %s ruleset shorthand', shorthand => {
    return expect(findRuleset('', `spectral:${shorthand}`)).resolves.toEqual(
      path.join(process.cwd(), `src/rulesets/${shorthand}/index.json`),
    );
  });

  it('should load local npm module if available', () => {
    return expect(findRuleset('', '@stoplight/json')).resolves.toEqual(require.resolve('@stoplight/json'));
  });

  it('should point to unpkg.com if npm module if unavailable', () => {
    return expect(findRuleset('', '@stoplight/foo-bar')).resolves.toEqual('https://unpkg.com/@stoplight/foo-bar');
  });
});
