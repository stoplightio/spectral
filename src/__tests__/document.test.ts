import { IParsedResult, isParsedResult } from '../document';

describe('isParsedResult util', () => {
  it('correctly identifies objects that fulfill the IParsedResult interface', () => {
    // @ts-expect-error: it's a test that's supposed to fail
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
