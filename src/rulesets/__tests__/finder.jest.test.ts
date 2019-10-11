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

  it.each(['oas', 'oas2', 'oas3'])('should support spectral built-in %s ruleset shorthand', shorthand => {
    return expect(findFile('', `spectral:${shorthand}`)).resolves.toEqual(
      path.join(process.cwd(), `src/rulesets/${shorthand}/index.json`),
    );
  });

  it.each(['oas', 'oas2', 'oas3'])(
    'should resolve spectral built-in %s ruleset shorthand even if a base uri is provided',
    shorthand => {
      return expect(findFile('https://localhost:4000', `spectral:${shorthand}`)).resolves.toEqual(
        path.join(process.cwd(), `src/rulesets/${shorthand}/index.json`),
      );
    },
  );

  it('should load local npm module if available', () => {
    return expect(findFile('', '@stoplight/json')).resolves.toEqual(require.resolve('@stoplight/json'));
  });

  it('should point to unpkg.com if npm module if unavailable', () => {
    return expect(findFile('', '@stoplight/foo-bar')).resolves.toEqual('https://unpkg.com/@stoplight/foo-bar');
  });
});
