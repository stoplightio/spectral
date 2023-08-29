import { applyUrlVariables } from '../applyUrlVariables';

describe('applyUrlVariables', () => {
  test('should return all possible combinations', () => {
    const result = [
      ...applyUrlVariables('{protocol}://{env}.stoplight.io:{port}', [
        ['protocol', ['https']],
        ['env', ['integration', 'staging', 'prod']],
        ['port', ['8080', '443']],
      ]),
    ];

    expect(result).toStrictEqual([
      'https://integration.stoplight.io:8080',
      'https://integration.stoplight.io:443',
      'https://staging.stoplight.io:8080',
      'https://staging.stoplight.io:443',
      'https://prod.stoplight.io:8080',
      'https://prod.stoplight.io:443',
    ]);
  });
});
