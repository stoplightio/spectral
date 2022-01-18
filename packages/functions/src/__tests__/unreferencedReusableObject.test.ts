import '@stoplight/spectral-test-utils/matchers';

import { RulesetValidationError } from '@stoplight/spectral-core';
import testFunction from './__helpers__/tester';
import unreferencedReusableObject from '../unreferencedReusableObject';
import AggregateError = require('es-aggregate-error');

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

    it.each<[unknown, RulesetValidationError[]]>([
      [
        null,
        [
          new RulesetValidationError(
            '"unreferencedReusableObject" function has invalid options specified. Example valid options: { "reusableObjectsLocation": "#/components/schemas" }, { "reusableObjectsLocation": "#/$defs" }',
            [],
          ),
        ],
      ],
      [
        2,
        [
          new RulesetValidationError(
            '"unreferencedReusableObject" function has invalid options specified. Example valid options: { "reusableObjectsLocation": "#/components/schemas" }, { "reusableObjectsLocation": "#/$defs" }',
            [],
          ),
        ],
      ],
      [
        {},
        [
          new RulesetValidationError(
            '"unreferencedReusableObject" function is missing "reusableObjectsLocation" option. Example valid options: { "reusableObjectsLocation": "#/components/schemas" }, { "reusableObjectsLocation": "#/$defs" }',
            [],
          ),
        ],
      ],
      [
        {
          reusableObjectsLocation: '#',
          foo: true,
        },
        [new RulesetValidationError('"unreferencedReusableObject" function does not support "foo" option', [])],
      ],
      [
        {
          reusableObjectsLocation: 2,
        },
        [
          new RulesetValidationError(
            '"unreferencedReusableObject" and its "reusableObjectsLocation" option support only valid JSON Pointer fragments, i.e. "#", "#/foo", "#/paths/~1user"',
            [],
          ),
        ],
      ],
      [
        {
          reusableObjectsLocation: 'foo',
        },
        [
          new RulesetValidationError(
            '"unreferencedReusableObject" and its "reusableObjectsLocation" option support only valid JSON Pointer fragments, i.e. "#", "#/foo", "#/paths/~1user"',
            [],
          ),
        ],
      ],
    ])('given invalid %p options, should throw', async (opts, errors) => {
      await expect(runUnreferencedReusableObject({}, opts)).rejects.toThrowAggregateError(new AggregateError(errors));
    });
  });
});
