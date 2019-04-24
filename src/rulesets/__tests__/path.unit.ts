import { resolvePath } from '../path';

describe('Path', () => {
  it('should resolve relative path', () => {
    expect(resolvePath('a/b/c', 'd')).toEqual(`${process.cwd()}/a/b/d`);
  });

  it('should resolve absolute path', () => {
    expect(resolvePath('a/b/c', '/d')).toEqual('/d');
  });

  it('should resolve http relative', () => {
    expect(resolvePath('http://www.example.com/a/b.json', 'd.json')).toEqual('http://www.example.com/a/d.json');
  });

  it('should resolve http absolute', () => {
    expect(resolvePath('http://www.example.com/a/b.json', 'http://www.acme.com/b.json')).toEqual(
      'http://www.acme.com/b.json'
    );
  });
});
