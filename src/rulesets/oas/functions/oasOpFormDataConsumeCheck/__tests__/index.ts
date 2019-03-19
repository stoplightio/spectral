import { Spectral } from '../../../../../index';
import { commonOasFunctions, commonOasRules } from '../../../index';

const ruleset = { functions: commonOasFunctions(), rules: commonOasRules() };

describe('oasOpFormDataConsumeCheck', () => {
  const s = new Spectral();
  s.addFunctions(ruleset.functions || {});
  s.addRules({
    'operation-formData-consume-check': Object.assign(ruleset.rules['operation-formData-consume-check'], {
      enabled: true,
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      paths: {
        '/path1': {
          get: {
            consumes: ['application/x-www-form-urlencoded', 'application/xml'],
            parameters: [{ in: 'formData', name: 'test' }],
          },
        },
      },
    });
    expect(results.results.length).toEqual(0);
  });

  test('return errors on different path operations same id', async () => {
    const results = await s.run({
      paths: {
        '/path1': {
          get: {
            consumes: ['application/xml'],
            parameters: [{ in: 'formData', name: 'test' }],
          },
        },
      },
    });

    expect(results.results).toMatchSnapshot();
  });
});
