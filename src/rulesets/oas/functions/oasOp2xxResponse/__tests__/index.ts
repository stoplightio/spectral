import { Spectral } from '../../../../../spectral';
import { commonOasFunctions, commonOasRules } from '../../../../oas/index';

const ruleset = { functions: commonOasFunctions(), rules: commonOasRules() };

describe('oasOp2xxResponse', () => {
  const s = new Spectral();
  s.addFunctions(ruleset.functions || {});
  s.addRules({
    'operation-2xx-response': Object.assign(ruleset.rules['operation-2xx-response'], {
      enabled: true,
    }),
  });

  test('validate a correct object', () => {
    const results = s.run({
      paths: {
        '/path1': {
          get: {
            responses: {
              '200': {
                description: '',
                schema: {
                  type: 'object',
                  properties: {},
                },
              },
            },
          },
        },
      },
    });
    expect(results.results.length).toEqual(0);
  });

  test('return errors if missing 2xx', () => {
    const results = s.run({
      paths: {
        '/path1': {
          get: {
            responses: {
              '400': {
                description: '',
                schema: {
                  type: 'object',
                  properties: {},
                },
              },
            },
          },
        },
      },
    });

    expect(results.results).toMatchSnapshot();
  });

  test('return errors if no responses', () => {
    const results = s.run({
      paths: {
        '/path1': {
          get: {
            responses: {},
          },
        },
      },
    });
    expect(results.results).toMatchSnapshot();
  });
});
