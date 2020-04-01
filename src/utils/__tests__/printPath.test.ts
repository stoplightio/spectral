import { printPath, PrintStyle } from '../printPath';

describe('printPath util', () => {
  describe('dot style', () => {
    it('handles basic scenarios', () => {
      expect(printPath([], PrintStyle.Dot)).toEqual('');
      expect(printPath(['user'], PrintStyle.Dot)).toEqual('user');
      expect(printPath(['user', 'age'], PrintStyle.Dot)).toEqual('user.age');
    });

    it('handles numeric segments', () => {
      expect(printPath(['schema', 'addresses', 0, 'street'], PrintStyle.Dot)).toEqual('schema.addresses[0].street');
      expect(printPath(['foo', '0', 1.2, 4], PrintStyle.Dot)).toEqual('foo[0][1.2][4]');
    });

    it('handles empty strings', () => {
      expect(printPath([''], PrintStyle.Dot)).toEqual("['']");
      expect(printPath(['a', '', 'test'], PrintStyle.Dot)).toEqual("a[''].test");
    });

    it('handles whitespaces', () => {
      expect(printPath(['a', ' bar ', 'test'], PrintStyle.Dot)).toEqual("a[' bar '].test");
      expect(printPath(['a', ' ', 'test'], PrintStyle.Dot)).toEqual("a[' '].test");
    });

    it('decodes ~0 and ~1', () => {
      expect(printPath(['paths', '~1pets', 'wildcard*~0'], PrintStyle.Dot)).toEqual('paths./pets.wildcard*~');
    });
  });

  describe('pointer style', () => {
    it('handles basic scenarios', () => {
      expect(printPath([], PrintStyle.Pointer)).toEqual('#');
      expect(printPath(['user'], PrintStyle.Pointer)).toEqual('#/user');
      expect(printPath(['user', 'age'], PrintStyle.Pointer)).toEqual('#/user/age');
    });

    it('handles numeric segments', () => {
      expect(printPath(['schema', 'addresses', 0, 'street'], PrintStyle.Pointer)).toEqual(
        '#/schema/addresses/0/street',
      );
      expect(printPath(['foo', '0', 1.2, 4], PrintStyle.Pointer)).toEqual('#/foo/0/1.2/4');
    });

    it('handles empty strings', () => {
      expect(printPath([''], PrintStyle.Pointer)).toEqual('#/');
      expect(printPath(['a', '', 'test'], PrintStyle.Pointer)).toEqual('#/a//test');
    });

    it('handles whitespaces', () => {
      expect(printPath(['a', ' bar ', 'test'], PrintStyle.Pointer)).toEqual('#/a/ bar /test');
      expect(printPath(['a', ' ', 'test'], PrintStyle.Pointer)).toEqual('#/a/ /test');
    });

    it('preserves slashes', () => {
      expect(printPath(['paths', '/pets'], PrintStyle.Pointer)).toEqual('#/paths//pets');
    });

    it('preserves tildes', () => {
      expect(printPath(['paths', 'wildcard~'], PrintStyle.Pointer)).toEqual('#/paths/wildcard~');
    });

    it('decodes ~0 and ~1', () => {
      expect(printPath(['paths', '~1pets', 'wildcard*~0'], PrintStyle.Pointer)).toEqual('#/paths//pets/wildcard*~');
    });
  });

  describe('escaped pointer style', () => {
    it('handles basic scenarios', () => {
      expect(printPath([], PrintStyle.EscapedPointer)).toEqual('#');
      expect(printPath(['user'], PrintStyle.EscapedPointer)).toEqual('#/user');
      expect(printPath(['user', 'age'], PrintStyle.EscapedPointer)).toEqual('#/user/age');
    });

    it('handles numeric segments', () => {
      expect(printPath(['schema', 'addresses', 0, 'street'], PrintStyle.EscapedPointer)).toEqual(
        '#/schema/addresses/0/street',
      );
      expect(printPath(['foo', '0', 1.2, 4], PrintStyle.EscapedPointer)).toEqual('#/foo/0/1.2/4');
    });

    it('handles empty strings', () => {
      expect(printPath([''], PrintStyle.EscapedPointer)).toEqual('#/');
      expect(printPath(['a', '', 'test'], PrintStyle.EscapedPointer)).toEqual('#/a//test');
    });

    it('handles whitespaces', () => {
      expect(printPath(['a', ' bar ', 'test'], PrintStyle.EscapedPointer)).toEqual('#/a/ bar /test');
      expect(printPath(['a', ' ', 'test'], PrintStyle.EscapedPointer)).toEqual('#/a/ /test');
    });

    it('escapes slashes', () => {
      expect(printPath(['paths', '/pets'], PrintStyle.EscapedPointer)).toEqual('#/paths/~1pets');
    });

    it('escapes tildes', () => {
      expect(printPath(['paths', 'wildcard~'], PrintStyle.EscapedPointer)).toEqual('#/paths/wildcard~0');
    });

    it('preserves ~0 and ~1', () => {
      expect(printPath(['paths', '~1pets', 'wildcard*~0'], PrintStyle.EscapedPointer)).toEqual(
        '#/paths/~1pets/wildcard*~0',
      );
    });
  });
});
