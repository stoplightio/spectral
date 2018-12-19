import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('operation-tags', () => {
  const s = new Spectral();
  s.addRules({
    'operation-tags': Object.assign(ruleset.rules['operation-tags'], {
      enabled: true,
    }),
  });

  test('validate a correct object', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            tags: [{ name: 'todos' }],
          },
        },
      },
    });
    expect(results.results.length).toEqual(0);
  });

  test('return errors if tags is missing', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {},
        },
      },
    });
    expect(results.results).toMatchSnapshot();
  });
});
