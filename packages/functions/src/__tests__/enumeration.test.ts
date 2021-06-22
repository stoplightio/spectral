import { RulesetValidationError } from '@stoplight/spectral-core';
import enumeration from '../enumeration';
import testFunction from './__helpers__/tester';

const runEnumeration = testFunction.bind(null, enumeration);

describe('Core Functions / Enumeration', () => {
  it('given valid input, should return no error message', async () => {
    expect(await runEnumeration('x', { values: ['x', 'y', 'z'] })).toEqual([]);
  });

  it('given invalid input, should return an error message', async () => {
    expect(await runEnumeration('x', { values: ['y', 'z'] })).toEqual([
      {
        message: '"x" must be equal to one of the allowed values: "y", "z"',
        path: [],
      },
    ]);
  });

  it('given no primitive value, should return no error message', async () => {
    expect(await runEnumeration({}, { values: ['test'] })).toEqual([]);
  });

  describe('validation', () => {
    it('given valid options, should not throw', async () => {
      expect(
        await runEnumeration('foo', {
          values: ['foo', 2],
        }),
      ).toEqual([]);
    });

    it.each<[unknown, string]>([
      [
        {
          values: ['foo', 2],
          foo: true,
        },
        '"enumeration" function does not support "foo" option',
      ],
      [
        {
          values: [{}],
        },
        '"enumeration" and its "values" option support only arrays of primitive values, i.e. ["Berlin", "London", "Paris"]',
      ],
      [
        null,
        '"enumeration" function has invalid options specified. Example valid options: { "values": ["Berlin", "London", "Paris"] }, { "values": [2, 3, 5, 8, 13, 21] }',
      ],
      [
        2,
        '"enumeration" function has invalid options specified. Example valid options: { "values": ["Berlin", "London", "Paris"] }, { "values": [2, 3, 5, 8, 13, 21] }',
      ],
    ])('given invalid %p options, should throw', async (opts, error) => {
      await expect(runEnumeration('foo', opts)).rejects.toThrow(new RulesetValidationError(error));
    });
  });
});
