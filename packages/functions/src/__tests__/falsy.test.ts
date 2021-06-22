import { RulesetValidationError } from '@stoplight/spectral-core';
import falsy from '../falsy';
import testFunction from './__helpers__/tester';

const runFalsy = testFunction.bind(null, falsy);

describe('Core Functions / Falsy', () => {
  it.each([false, null, 0, ''])('given falsy %p input, should return no error message', async input => {
    expect(await runFalsy(input)).toEqual([]);
  });

  it.each([true, 1, [], {}])('given truthy %p input, should return an error message', async input => {
    expect(await runFalsy(input)).toEqual([
      {
        message: 'The document must be falsy',
        path: [],
      },
    ]);
  });

  describe('validation', () => {
    it.each([{}, 2])('given invalid %p options, should throw', async opts => {
      await expect(runFalsy([], opts)).rejects.toThrow(
        new RulesetValidationError('"falsy" function does not accept any options'),
      );
    });
  });
});
