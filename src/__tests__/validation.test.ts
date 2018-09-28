import { IRuleResult, IRuleConfig, Rule } from '@spectral/types';
import { Spectral } from '@spectral/index';

const petstoreV2 = require('./fixtures/petstore.oas2.json');
const petstoreV3 = require('./fixtures/petstore.oas3.json');

const invalidV2 = require('./fixtures/todos.invalid.oas2.json');

const applyRuleToObject = (r: Rule, o: object): IRuleResult[] => {
  const cfg: IRuleConfig = {
    rules: {
      testing: {
        'test:rule': r,
      },
    },
  };
  const s = new Spectral(cfg);
  return s.apply(o, 'testing');
};

describe('validation', () => {
  test('validate a correct OASv2 spec', () => {
    expect(
      applyRuleToObject(
        {
          type: 'schema',
          path: '$',
          enabled: true,
          description: 'parameter objects should have a description',
          severity: 'error',
          schema: 'oas2',
        },
        petstoreV2
      ).length
    ).toEqual(0);
  });

  test('return errors on invalid OASv2 spec', () => {
    const results = applyRuleToObject(
      {
        type: 'schema',
        path: '$',
        enabled: true,
        description: 'validate structure of OpenAPIv2 specification',
        severity: 'error',
        schema: 'oas2',
      },
      invalidV2
    );
    console.log(results);
    expect(results.length).toEqual(1);
    // expect(results[0].path).toEqual(['info', 'license', 'name']);
    // expect(results[0].message).toEqual('should be string');
  });

  test('validate a correct OASv3 spec', () => {
    expect(
      applyRuleToObject(
        {
          type: 'schema',
          path: '$',
          enabled: true,
          description: '',
          severity: 'error',
          schema: 'oas3',
        },
        petstoreV3
      ).length
    ).toEqual(0);
  });

  test('validate multiple formats with same validator', () => {
    const cfg: IRuleConfig = {
      rules: {
        oas2: {
          'validate:oas2-schema': {
            type: 'schema',
            path: '$',
            enabled: true,
            description: '',
            severity: 'error',
            schema: 'oas2',
          },
        },
        oas3: {
          'validate:oas3-schema': {
            type: 'schema',
            path: '$',
            enabled: true,
            description: '',
            schema: 'oas3',
          },
        },
      },
    };
    const s = new Spectral(cfg);
    let results = s.apply(petstoreV2, 'oas2');
    expect(results.length).toEqual(0);

    results = s.apply(petstoreV3, 'oas3');
    expect(results.length).toEqual(0);
  });
});
