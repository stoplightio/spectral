import { RulesetValidationError } from '@stoplight/spectral-core';
import testFunction from './__helpers__/tester';
import unreferencedReusableObject from '../unreferencedReusableObject';

const runUnreferencedReusableObject = testFunction.bind(null, unreferencedReusableObject);

describe('Core Functions / UnreferencedReusableObject', () => {
  it('given a non object data, should return no error message', async () => {
    expect(await runUnreferencedReusableObject('Nope', { reusableObjectsLocation: '#' })).toEqual([]);
  });

  describe('validation', () => {
    it.each([
      {
        reusableObjectsLocation: '#',
      },
      {
        reusableObjectsLocation: '#/',
      },
      {
        reusableObjectsLocation: '#/~1/d',
      },
    ])('given valid %p options, should not throw', async opts => {
      expect(await runUnreferencedReusableObject({}, opts)).toEqual([]);
    });

    it.each<[unknown, string]>([
      [
        null,
        '"unreferencedReusableObject" function has invalid options specified. Example valid options: { "reusableObjectsLocation": "#/components/schemas" }, { "reusableObjectsLocation": "#/$defs" }',
      ],
      [
        2,
        '"unreferencedReusableObject" function has invalid options specified. Example valid options: { "reusableObjectsLocation": "#/components/schemas" }, { "reusableObjectsLocation": "#/$defs" }',
      ],
      [
        {},
        '"unreferencedReusableObject" function is missing "reusableObjectsLocation" option. Example valid options: { "reusableObjectsLocation": "#/components/schemas" }, { "reusableObjectsLocation": "#/$defs" }',
      ],
      [
        {
          reusableObjectsLocation: '#',
          foo: true,
        },
        '"unreferencedReusableObject" function does not support "foo" option',
      ],
      [
        {
          reusableObjectsLocation: 2,
        },
        '"unreferencedReusableObject" and its "reusableObjectsLocation" option support only valid JSON Pointer fragments, i.e. "#", "#/foo", "#/paths/~1user"',
      ],
      [
        {
          reusableObjectsLocation: 'foo',
        },
        '"unreferencedReusableObject" and its "reusableObjectsLocation" option support only valid JSON Pointer fragments, i.e. "#", "#/foo", "#/paths/~1user"',
      ],
    ])('given invalid %p options, should throw', async (opts, error) => {
      await expect(runUnreferencedReusableObject({}, opts)).rejects.toThrow(new RulesetValidationError(error));
    });
  });
});
