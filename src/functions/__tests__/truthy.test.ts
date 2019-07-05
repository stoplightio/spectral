import { truthy } from '../truthy';

function runTruthy(targetVal: any, targetPath?: any) {
  return truthy(
    targetVal,
    null,
    {
      given: ['$'],
      target: targetPath,
    },
    {
      given: null,
      original: null,
    },
  );
}

describe('truthy', () => {
  test('should return undefined if target value is truthy', () => {
    expect(runTruthy(true)).toBeUndefined();
  });

  test('should return an error message if target value is falsy', () => {
    expect(runTruthy(false)).toEqual([
      {
        message: 'property is not truthy',
      },
    ]);
  });

  test('should return an error message if target value is null', () => {
    expect(runTruthy(null)).toEqual([
      {
        message: 'property is not truthy',
      },
    ]);
  });

  test('should return a detailed error message if target path is set', () => {
    expect(runTruthy(null, ['a', 'b'])).toEqual([
      {
        message: 'a.b is not truthy',
      },
    ]);
  });
});
