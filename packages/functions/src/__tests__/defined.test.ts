import '@stoplight/spectral-test-utils/matchers';

import defined from '../defined';
import testFunction from './__helpers__/tester';
import { RulesetValidationError } from '@stoplight/spectral-core';
import AggregateError = require('es-aggregate-error');

const runDefined = testFunction.bind(null, defined);

describe('Core Functions / Defined', () => {
  it.each([true, 0, null])('given defined input, should return no error message', async value => {
    expect(await runDefined(value)).toEqual([]);
  });

  it('given undefined input, should return an error message', async () => {
    expect(await runDefined({}, null, { then: { field: 'foo' } })).toEqual([
      {
        message: '"foo" property must be defined',
        path: [],
      },
    ]);
  });

  describe('validation', () => {
    it.each([{}, 2])('given invalid %p options, should throw', async opts => {
      await expect(runDefined([], opts)).rejects.toThrowAggregateError(
        new AggregateError([
          new RulesetValidationError('invalid-function-options', '"defined" function does not accept any options', [
            'rules',
            'my-rule',
            'then',
            'functionOptions',
          ]),
        ]),
      );
    });
  });
});
