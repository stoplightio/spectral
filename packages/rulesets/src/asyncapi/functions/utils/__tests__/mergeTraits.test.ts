import { mergeTraits } from '../mergeTraits';

describe('mergeTraits', () => {
  test('should merge one trait', () => {
    const result = mergeTraits({ payload: {}, traits: [{ payload: { someKey: 'someValue' } }] });
    expect(result.payload).toEqual({ someKey: 'someValue' });
  });

  test('should merge two or more traits', () => {
    const result = mergeTraits({
      payload: {},
      traits: [
        { payload: { someKey1: 'someValue1' } },
        { payload: { someKey2: 'someValue2' } },
        { payload: { someKey3: 'someValue3' } },
      ],
    });
    expect(result.payload).toEqual({ someKey1: 'someValue1', someKey2: 'someValue2', someKey3: 'someValue3' });
  });

  test('should override fields', () => {
    const result = mergeTraits({
      payload: { someKey: 'someValue' },
      traits: [
        { payload: { someKey: 'someValue1' } },
        { payload: { someKey: 'someValue2' } },
        { payload: { someKey: 'someValue3' } },
      ],
    });
    expect(result.payload).toEqual({ someKey: 'someValue3' });
  });
});
