import { Spectral } from '../../../../../index';
import { commonOasRuleset } from '../../../index';

const ruleset = commonOasRuleset();

describe('oasOpNoBodyFormData', () => {
  const s = new Spectral({
    rulesets: [
      {
        functions: ruleset.functions,
        rules: {
          oas2: {
            'operation-no-body-formData': Object.assign(
              ruleset.rules['oas2|oas3']['operation-no-body-formData'],
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

  test('validate a correct object (just in body)', () => {
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

  test('return errors when both in:body and in:formData', () => {
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
                  in: 'formData',
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
