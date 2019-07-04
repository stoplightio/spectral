import * as path from '@stoplight/path';
import { resolvePath } from '../resolver';

// @oclif/test packages requires @types/mocha, therefore we have 2 packages coming up with similar typings
// TS is confused and prefers the mocha ones, so we need to instrument it to pick up the Jest ones
declare var it: jest.It;

describe('Resolver', () => {
  it('should join relative path', () => {
    return expect(resolvePath(__filename, './resolver.test.ts')).resolves.toEqual(
      path.join(__dirname, './resolver.test.ts'),
    );
  });

  it('should join absolute path', () => {
    return expect(resolvePath('a/b/c', '/d')).resolves.toEqual('/d');
  });

  it('should join http relative', () => {
    return expect(resolvePath('http://www.example.com/a/b.json', 'd.json')).resolves.toEqual(
      'http://www.example.com/a/d.json',
    );
  });

  it('should resolve http absolute', () => {
    return expect(resolvePath('http://www.example.com/a/b.json', 'http://www.acme.com/b.json')).resolves.toEqual(
      'http://www.acme.com/b.json',
    );
  });

  it('should support spectral built-in rules', () => {
    return expect(resolvePath('/b/c/d', '@stoplight/spectral/rulesets/oas2/index.json')).resolves.toEqual(
      path.join(process.cwd(), 'src/rulesets/oas2/index.json'),
    );
  });

  it.each(['oas', 'oas2', 'oas3'])('should support spectral built-in %s ruleset shorthand', shorthand => {
    return expect(resolvePath('', `spectral:${shorthand}`)).resolves.toEqual(
      path.join(process.cwd(), `src/rulesets/${shorthand}/index.json`),
    );
  });

  it('should load local npm module if available', () => {
    return expect(resolvePath('', '@stoplight/json')).resolves.toEqual(require.resolve('@stoplight/json'));
  });

  it('should point to unpkg.com if npm module if unavailable', () => {
    return expect(resolvePath('', '@stoplight/foo-bar')).resolves.toEqual('https://unpkg.com/@stoplight/foo-bar');
  });
});
