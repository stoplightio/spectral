import { RulesetValidationError } from '@stoplight/spectral-core';
import testFunction from './__helpers__/tester';
import length from '../length';
import '@stoplight/spectral-test-utils/matchers';
import AggregateError = require('es-aggregate-error');

const runLength = testFunction.bind(null, length);

describe('Core Functions / Length', () => {
  const values = [
    '123',
    3,
    [1, 2, 3],
    {
      one: 1,
      two: 2,
      three: 3,
    },
  ];

  it.each(values)(
    'given a string, number, array, or object greater than max, should return an error message',
    async input => {
      expect(await runLength(input, { max: 2 })).toEqual([
        {
          message: 'The document must be shorter than 2',
          path: [],
        },
      ]);
    },
  );

  it.each(values)(
    'given a string, number, array, or object smaller than min, should return an error message',
    async input => {
      expect(await runLength(input, { min: 4 })).toEqual([
        {
          message: 'The document must be longer than 4',
          path: [],
        },
      ]);
    },
  );

  it.each(values)(
    'given string, number, array, or object in between min and max, should return no error message',
    async input => {
      expect(await runLength(input, { min: 3, max: 3 })).toEqual([]);
    },
  );

  describe('validation', () => {
    it.each([{ min: 2 }, { max: 4 }, { min: 2, max: 4 }])('given valid %p options, should not throw', async opts => {
      expect(await runLength('foo', opts)).toEqual([]);
    });

    it.each<[unknown, RulesetValidationError[]]>([
      [
        null,
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"length" function has invalid options specified. Example valid options: { "min": 2 }, { "max": 5 }, { "min": 0, "max": 10 }',
            ['rules', 'my-rule', 'then', 'functionOptions'],
          ),
        ],
      ],
      [
        2,
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"length" function has invalid options specified. Example valid options: { "min": 2 }, { "max": 5 }, { "min": 0, "max": 10 }',
            ['rules', 'my-rule', 'then', 'functionOptions'],
          ),
        ],
      ],
      [
        {
          min: 2,
          foo: true,
        },
        [
          new RulesetValidationError('invalid-function-options', '"length" function does not support "foo" option', [
            'rules',
            'my-rule',
            'then',
            'functionOptions',
            'foo',
          ]),
        ],
      ],
      [
        { min: '2' },
        [
          new RulesetValidationError(
            'invalid-function-options',
            `"length" function and its "min" option accepts only the following types: number`,
            ['rules', 'my-rule', 'then', 'functionOptions', 'min'],
          ),
        ],
      ],

      [
        { max: '2' },
        [
          new RulesetValidationError(
            'invalid-function-options',
            `"length" function and its "max" option accepts only the following types: number`,
            ['rules', 'my-rule', 'then', 'functionOptions', 'max'],
          ),
        ],
      ],
      [
        { min: '4', max: '2' },
        [
          new RulesetValidationError(
            'invalid-function-options',
            `"length" function and its "min" option accepts only the following types: number`,
            ['rules', 'my-rule', 'then', 'functionOptions', 'min'],
          ),
          new RulesetValidationError(
            'invalid-function-options',
            `"length" function and its "max" option accepts only the following types: number`,
            ['rules', 'my-rule', 'then', 'functionOptions', 'max'],
          ),
        ],
      ],
    ])('given invalid %p options, should throw', async (opts, errors) => {
      await expect(runLength('foo', opts)).rejects.toThrowAggregateError(new AggregateError(errors));
    });
  });
});
