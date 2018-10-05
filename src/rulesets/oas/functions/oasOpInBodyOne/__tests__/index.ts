import { Spectral } from '../../../../../index';
import { commonOasRuleset } from '../../../index';

const ruleset = commonOasRuleset();

describe('oasOpInBodyOne', () => {
  const s = new Spectral({
    rulesets: [
      {
        functions: ruleset.functions,
        rules: {
          oas2: {
            'operation-in-body-one': Object.assign(
              ruleset.rules['oas2|oas3']['operation-in-body-one'],
              {
                enabled: true,
              }
            ),
          },
        },
      },
    ],
  });

  test('validate a correct object', () => {
    const results = s.run({
      spec: 'oas2',
      target: {
        paths: {
          '/path1': {
            get: {
              parameters: [
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

  test('return errors when multiple in body', () => {
    const results = s.run({
      spec: 'oas2',
      target: {
        paths: {
          '/path1': {
            get: {
              parameters: [
                {
                  name: 'lol',
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

    expect(results.length).toEqual(1);
  });
});
