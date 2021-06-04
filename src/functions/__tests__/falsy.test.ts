import { falsy } from '../falsy';

function runFalsy(targetVal: any, targetPath?: any) {
  return falsy(
    targetVal,
    null,
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
  it('returns undefined if target value is falsy', () => {
    expect(runFalsy(false)).toBeUndefined();
  });

  it('returns undefined if target value is null', () => {
    expect(runFalsy(null)).toBeUndefined();
  });

  it('returns error message if target value is not falsy', () => {
    expect(runFalsy(true)).toEqual([
      {
        message: '#{{print("property")}}must be falsy',
      },
    ]);
  });

  it('returns undefined if target path is set', () => {
    expect(runFalsy(null, ['a', 'b'])).toBeUndefined();
  });
});
