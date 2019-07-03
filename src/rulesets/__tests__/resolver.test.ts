import * as path from '@stoplight/path';
import { resolvePath } from '../resolver';

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

  it('should support spectral built-in rules shorthands', () => {
    return expect(resolvePath('', 'spectral:oas2')).resolves.toEqual(
      path.join(process.cwd(), 'src/rulesets/oas2/index.json'),
    );
  });

  it('should load local npm module if available', () => {
    return expect(resolvePath('', '@stoplight/json')).resolves.toEqual(require.resolve('@stoplight/json'));
  });

  it('should point to unpkg.com if npm module if unavailable', () => {
    return expect(resolvePath('', '@stoplight/foo-bar')).resolves.toEqual('https://unpkg.com/@stoplight/foo-bar');
  });
});
