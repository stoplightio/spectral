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
    } as any,
  );
}

describe('truthy', () => {
  test('should return undefined if target value is truthy', () => {
    expect(runTruthy(true)).toBeUndefined();
  });

  test('should return an error message if target value is falsy', () => {
    expect(runTruthy(false)).toEqual([
      {
        message: '#{{print("property")}}must be truthy',
      },
    ]);
  });

  test('should return an error message if target value is null', () => {
    expect(runTruthy(null)).toEqual([
      {
        message: '#{{print("property")}}must be truthy',
      },
    ]);
  });
});
