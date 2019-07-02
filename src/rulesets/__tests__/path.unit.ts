import * as path from 'path';
import { resolvePath } from '../path';

describe('Path', () => {
  it('should join relative path', () => {
    expect(resolvePath('a/b/c', 'd')).toEqual(`a/b/c/d`);
  });

  it('should join absolute path', () => {
    expect(resolvePath('a/b/c', '/d')).toEqual('/d');
  });

  it('should join http relative', () => {
    expect(resolvePath('http://www.example.com/a/b.json', 'd.json')).toEqual('http://www.example.com/a/d.json');
  });

  it('should resolve http absolute', () => {
    expect(resolvePath('http://www.example.com/a/b.json', 'http://www.acme.com/b.json')).toEqual(
      'http://www.acme.com/b.json',
    );
  });

  it('should support spectral built-in rules', () => {
    expect(resolvePath('/b/c/d', '@stoplight/spectral/rulesets/oas2/ruleset.json')).toEqual(
      path.join(process.cwd(), 'src/rulesets/oas2/ruleset.json'),
    );
  });
});
