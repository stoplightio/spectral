import { Spectral } from '../../../spectral';
import * as ruleset from '../ruleset.json';

describe('model-description', () => {
  const s = new Spectral();
  s.addRules({
    // @ts-ignore
    'model-description': Object.assign(ruleset.rules['model-description'], {
      enabled: true,
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      host: 'stoplight.io',
      definitions: {
        user: {
          description: 'this describes the user model',
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if a definition is missing description', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      host: 'stoplight.io',
      definitions: { user: {} },
    });
    expect(results).toMatchSnapshot();
  });
});
