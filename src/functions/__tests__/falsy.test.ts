import { falsy } from '../falsy';

function runFalsy(targetVal: any, targetPath?: any) {
  return falsy(
    targetVal,
    void 0,
    {
      given: ['$'],
      target: targetPath,
    },
    {
      given: null,
      original: null,
    } as any,
  );
}

describe('falsy', () => {
  test('returns undefined if target value is falsy', () => {
    expect(runFalsy(false)).toBeUndefined();
  });

  test('returns undefined if target value is null', () => {
    expect(runFalsy(null)).toBeUndefined();
  });

  test('returns error message if target value is not falsy', () => {
    expect(runFalsy(true)).toEqual([
      {
        message: '{{property|gravis|append-property}}is not falsy',
      },
    ]);
  });

  test('returns undefined if target path is set', () => {
    expect(runFalsy(null, ['a', 'b'])).toBeUndefined();
  });
});
