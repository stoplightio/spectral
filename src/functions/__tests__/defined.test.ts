import { defined } from '../defined';

function runDefined(targetVal: any, targetPath?: any) {
  return defined(
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

describe('defined', () => {
  test.each([true, 0, null])('should return undefined if target value is defined', value => {
    expect(runDefined(value)).toBeUndefined();
  });

  it('should return an error message if target value is undefined', () => {
    expect(runDefined(void 0)).toEqual([
      {
        message: '#{{print("property")}}must be defined',
      },
    ]);
  });
});
