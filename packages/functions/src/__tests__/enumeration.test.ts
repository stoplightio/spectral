import '@stoplight/spectral-test-utils/matchers';

import { RulesetValidationError } from '@stoplight/spectral-core';
import enumeration from '../enumeration';
import testFunction from './__helpers__/tester';
import AggregateError = require('es-aggregate-error');

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

    it.each<[unknown, RulesetValidationError[]]>([
      [
        {
          values: ['foo', 2],
          foo: true,
        },
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"enumeration" function does not support "foo" option',
            ['rules', 'my-rule', 'then', 'functionOptions', 'foo'],
          ),
        ],
      ],
      [
        {
          values: [{}],
        },
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"enumeration" and its "values" option support only arrays of primitive values, i.e. ["Berlin", "London", "Paris"]',
            ['rules', 'my-rule', 'then', 'functionOptions', 'values'],
          ),
        ],
      ],
      [
        null,
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"enumeration" function has invalid options specified. Example valid options: { "values": ["Berlin", "London", "Paris"] }, { "values": [2, 3, 5, 8, 13, 21] }',
            ['rules', 'my-rule', 'then', 'functionOptions'],
          ),
        ],
      ],
      [
        2,
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"enumeration" function has invalid options specified. Example valid options: { "values": ["Berlin", "London", "Paris"] }, { "values": [2, 3, 5, 8, 13, 21] }',
            ['rules', 'my-rule', 'then', 'functionOptions'],
          ),
        ],
      ],
    ])('given invalid %p options, should throw', async (opts, errors) => {
      await expect(runEnumeration('foo', opts)).rejects.toThrowAggregateError(new AggregateError(errors));
    });
  });
});
