import { IParsedResult, isParsedResult } from '../document';

describe('isParsedResult util', () => {
  test('correctly identifies objects that fulfill the IParsedResult interface', () => {
    // @ts-ignore
    expect(isParsedResult()).toBe(false);

    expect(isParsedResult('')).toBe(false);
    expect(isParsedResult([])).toBe(false);
    expect(isParsedResult({})).toBe(false);
    expect(
      isParsedResult({
        parsed: undefined,
      }),
    ).toBe(false);

    expect(
      isParsedResult({
        parsed: [],
      }),
    ).toBe(false);

    expect(
      isParsedResult({
        parsed: {
          data: {},
        },
      }),
    ).toBe(false);

    const obj: IParsedResult = {
      getLocationForJsonPath: jest.fn(),
      parsed: {
        data: {},
        ast: {},
        lineMap: [],
        diagnostics: [],
      },
    };

    expect(isParsedResult(obj)).toBe(true);
  });
});
