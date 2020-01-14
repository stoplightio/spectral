import { getLintTargets } from '../getLintTargets';

describe('getLintTargets', () => {
  describe('when @key is given as field', () => {
    it('given object, returns its keys', () => {
      expect(getLintTargets({ a: null, b: true }, '@key')).toStrictEqual([
        {
          path: ['a'],
          value: 'a',
        },
        {
          path: ['b'],
          value: 'b',
        },
      ]);
    });

    it('given array, returns its indicies', () => {
      expect(getLintTargets(['foo', 'bar'], '@key')).toStrictEqual([
        {
          path: ['0'],
          value: '0',
        },
        {
          path: ['1'],
          value: '1',
        },
      ]);
    });

    it('given primitive property, returns the whole input', () => {
      expect(getLintTargets('abc', '0')).toStrictEqual([
        {
          path: [],
          value: 'abc',
        },
      ]);
    });
  });

  describe('when property path is given as field', () => {
    it('given existing property, returns lint targets', () => {
      expect(getLintTargets({ a: null }, 'a')).toStrictEqual([
        {
          path: ['a'],
          value: null,
        },
      ]);

      expect(getLintTargets({ foo: ['a'] }, 'foo[0]')).toStrictEqual([
        {
          path: ['foo', '0'],
          value: 'a',
        },
      ]);

      expect(getLintTargets(['foo'], '0')).toStrictEqual([
        {
          path: ['0'],
          value: 'foo',
        },
      ]);

      expect(getLintTargets({ a: void 0 }, 'a')).toStrictEqual([
        {
          path: ['a'],
          value: void 0,
        },
      ]);
    });

    it('given non-existing property, returns the whole document', () => {
      expect(getLintTargets({ a: null }, 'b')).toStrictEqual([
        {
          path: ['b'],
          value: void 0,
        },
      ]);

      expect(getLintTargets(['foo'], '1')).toStrictEqual([
        {
          path: ['1'],
          value: void 0,
        },
      ]);
    });

    it('given primitive property, returns the whole input', () => {
      expect(getLintTargets('abc', '0')).toStrictEqual([
        {
          path: [],
          value: 'abc',
        },
      ]);
    });
  });

  describe('when JSON Path expression is given as field', () => {
    it('given existing property, returns lint targets', () => {
      expect(getLintTargets({ a: null }, '$')).toStrictEqual([
        {
          path: [],
          value: {
            a: null,
          },
        },
      ]);

      expect(getLintTargets({ foo: ['a'] }, '$.foo.*')).toStrictEqual([
        {
          path: ['foo', '0'],
          value: 'a',
        },
      ]);
    });

    it('given non-existing property, returns lint target with undefined value', () => {
      expect(getLintTargets({ a: null }, '$.b')).toStrictEqual([
        {
          path: [],
          value: void 0,
        },
      ]);

      expect(getLintTargets(['foo'], '$..bar')).toStrictEqual([
        {
          path: [],
          value: void 0,
        },
      ]);
    });

    it('given primitive property, returns the whole input', () => {
      expect(getLintTargets('abc', '0')).toStrictEqual([
        {
          path: [],
          value: 'abc',
        },
      ]);
    });
  });

  it('given no field, returns the whole input', () => {
    expect(getLintTargets({ a: true }, void 0)).toStrictEqual([
      {
        path: [],
        value: { a: true },
      },
    ]);
  });
});
