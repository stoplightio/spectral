import { Spectral } from '../../../../../index';
import { commonOasRuleset } from '../../../index';

const ruleset = commonOasRuleset();

describe('oasOpFormDataConsumeCheck', () => {
  const s = new Spectral({
    rulesets: [
      {
        functions: ruleset.functions,
        rules: {
          oas2: {
            'operation-formData-consume-check': Object.assign(
              ruleset.rules['oas2|oas3']['operation-formData-consume-check'],
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
              consumes: ['application/x-www-form-urlencoded', 'application/xml'],
              parameters: [{ in: 'formData', name: 'test' }],
            },
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors on different path operations same id', () => {
    const results = s.run({
      spec: 'oas2',
      target: {
        paths: {
          '/path1': {
            get: {
              consumes: ['application/xml'],
              parameters: [{ in: 'formData', name: 'test' }],
            },
          },
        },
      },
    });

    expect(results.length).toEqual(1);
  });
});
