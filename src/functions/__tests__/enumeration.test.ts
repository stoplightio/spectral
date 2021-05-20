import { enumeration } from '../enumeration';

function runEnum(targetVal: any, values: any[]) {
  return enumeration(
    targetVal,
    {
      values,
    },
    {
      given: [],
    },
    {
      given: [],
      original: '',
    } as any,
  );
}

describe('enum', () => {
  test('should return undefined if target value is truthy', () => {
    expect(runEnum('x', ['x', 'y', 'z'])).toEqual([]);
  });

  test('should return an error message if target value is falsy', () => {
    const results = runEnum('x', ['y', 'z']);
    expect(results).toHaveLength(1);
    expect(results[0].message).toEqual(`#{{print("value")}} must be equal to one of the allowed values: "y", "z"`);
  });
});
