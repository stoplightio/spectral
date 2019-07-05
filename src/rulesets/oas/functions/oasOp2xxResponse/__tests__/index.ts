import { RuleType, Spectral } from '../../../../../spectral';
import { commonOasFunctions } from '../../../../oas/index';
import { rules } from '../../../../oas/rules.json';
const ruleset = { functions: commonOasFunctions(), rules };

describe('oasOp2xxResponse', () => {
  const s = new Spectral();
  s.addFunctions(ruleset.functions || {});
  s.addRules({
    'operation-2xx-response': Object.assign(ruleset.rules['operation-2xx-response'], {
      recommended: true,
      type: RuleType[ruleset.rules['operation-2xx-response'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
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
    expect(results.length).toEqual(0);
  });

  test('return errors if missing 2xx', async () => {
    const results = await s.run({
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

    expect(results).toMatchSnapshot();
  });

  test('return errors if no responses', async () => {
    const results = await s.run({
      paths: {
        '/path1': {
          get: {
            responses: {},
          },
        },
      },
    });
    expect(results).toMatchSnapshot();
  });
});
