import { Spectral } from '../../../spectral';
import * as ruleset from '../ruleset.json';

describe('operation-summary-formatted', () => {
  const s = new Spectral();
  s.addRules({
    // @ts-ignore
    'operation-summary-formatted': Object.assign(ruleset.rules['operation-summary-formatted'], {
      enabled: true,
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            summary: 'This is a valid summary.',
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if summary does not start with an uppercase', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            summary: 'this is not a valid summary.',
          },
        },
      },
    });
    expect(results).toMatchSnapshot();
  });

  test('return errors if summary does not end with a dot', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            summary: 'This is not a valid summary',
          },
        },
      },
    });
    expect(results).toMatchSnapshot();
  });
});
