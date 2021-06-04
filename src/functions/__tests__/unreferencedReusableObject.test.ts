import { unreferencedReusableObject } from '../unreferencedReusableObject';

function runUnreferencedReusableObject(data: any, reusableObjectsLocation: string) {
  return unreferencedReusableObject(data, { reusableObjectsLocation }, { given: ['$'] }, {
    given: null,
    original: null,
  } as any);
}

describe('unreferencedReusableObject', () => {
  it('throws when reusableObjectsLocation does not look like a valid local json pointer', () => {
    expect(() => runUnreferencedReusableObject({}, 'Nope')).toThrow();
  });

  it('given a non object data should return nothing', () => {
    expect(runUnreferencedReusableObject('Nope', '#')).toBeUndefined();
  });
});
