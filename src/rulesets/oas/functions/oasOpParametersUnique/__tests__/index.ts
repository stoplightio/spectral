import { Spectral } from '../../../../../index';
import { commonOasRuleset } from '../../../index';

const ruleset = commonOasRuleset();

describe('oasOpParametersUnique', () => {
  const s = new Spectral({
    rulesets: [
      {
        functions: ruleset.functions,
        rules: {
          oas2: {
            'operation-parameters-unique': Object.assign(
              ruleset.rules['oas2|oas3']['operation-parameters-unique'],
              {
                enabled: true,
              }
            ),
          },
        },
      },
    ],
  });

  test('validate a correct object (just in body)', () => {
    const results = s.run({
      spec: 'oas2',
      target: {
        paths: {
          '/path1': {
            get: {
              parameters: [
                {
                  name: 'name',
                  in: 'body',
                  type: 'string',
                  required: true,
                },
                {
                  name: 'id',
                  in: 'body',
                  type: 'string',
                  required: true,
                },
              ],
            },
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors when nonunique parameters', () => {
    const results = s.run({
      spec: 'oas2',
      target: {
        paths: {
          '/path1': {
            get: {
              parameters: [
                {
                  name: 'name',
                  in: 'body',
                  type: 'string',
                  required: true,
                },
                {
                  name: 'name',
                  in: 'body',
                  type: 'string',
                  required: true,
                },
              ],
            },
          },
        },
      },
    });

    expect(results.length).toEqual(2);
  });
});
