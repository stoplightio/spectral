import truthy from '../truthy';
import testFunction from './__helpers__/tester';
import { RulesetValidationError } from '../../ruleset/validation';

const runTruthy = testFunction.bind(null, truthy);

describe('Core Functions / Truthy', () => {
  it.each([true, 1, [], {}])('given truthy %p input, should return no error message', async input => {
    expect(await runTruthy(input)).toEqual([]);
  });

  it.each([false, null, 0, ''])('given falsy %p input, should return an error message', async input => {
    expect(await runTruthy(input)).toEqual([
      {
        message: 'The document must be truthy',
        path: [],
      },
    ]);
  });

  describe('validation', () => {
    it.each([{}, 2])('given invalid %p options, should throw', async opts => {
      await expect(runTruthy([], opts)).rejects.toThrow(
        new RulesetValidationError('"truthy" function does not accept any options'),
      );
    });
  });
});
