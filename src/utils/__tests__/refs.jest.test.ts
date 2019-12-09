import { traverseObjUntilRef } from '..';

describe('$ref utils', () => {
  describe('traverseObjUntilRef', () => {
    it('given a broken json path, throws', () => {
      const obj = {
        foo: {
          bar: {
            baz: '',
          },
        },
        bar: '',
      };

      expect(traverseObjUntilRef.bind(null, obj, ['foo', 'baz'])).toThrow('Segment is not a part of the object');
      expect(traverseObjUntilRef.bind(null, obj, ['bar', 'foo'])).toThrow('Segment is not a part of the object');
    });

    it('given a json path pointing at object with ref, returns the ref', () => {
      const obj = {
        x: {
          $ref: 'test.json#',
        },
        foo: {
          bar: {
            $ref: '../a.json#',
          },
        },
      };

      expect(traverseObjUntilRef(obj, ['x', 'bar'])).toEqual('test.json#');
      expect(traverseObjUntilRef(obj, ['foo', 'bar', 'baz'])).toEqual('../a.json#');
    });

    it('given a finite json path pointing at value in project, returns null', () => {
      const obj = {
        x: {},
        foo: {
          bar: 'test',
        },
      };

      expect(traverseObjUntilRef(obj, ['x'])).toBeNull();
      expect(traverseObjUntilRef(obj, ['foo'])).toBeNull();
      expect(traverseObjUntilRef(obj, ['foo', 'bar'])).toBeNull();
    });
  });
});
