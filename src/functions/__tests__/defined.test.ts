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

  test('should return an error message if target value is undefined', () => {
    expect(runDefined(void 0)).toEqual([
      {
        message: '{{property|gravis|append-property}}should be defined',
      },
    ]);
  });
});
