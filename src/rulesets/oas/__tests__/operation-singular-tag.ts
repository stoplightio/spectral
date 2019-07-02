import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('operation-singular-tag', () => {
  const s = new Spectral();
  s.addRules({
    'operation-singular-tag': Object.assign(ruleset.rules['operation-singular-tag'], {
      enabled: true,
      type: RuleType[ruleset.rules['operation-singular-tag'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            tags: ['todos'],
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if tags has more than 1', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            tags: ['todos', 'private'],
          },
        },
      },
    });
    expect(results).toMatchSnapshot();
  });
});
