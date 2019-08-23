import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../../index';
import { commonOasFunctions } from '../../index';
import { rules } from '../../index.json';

const ruleset = { functions: commonOasFunctions(), rules };

describe('oasOpFormDataConsumeCheck', () => {
  const s = new Spectral();
  s.setFunctions(ruleset.functions || {});
  s.setRules({
    'operation-formData-consume-check': Object.assign(ruleset.rules['operation-formData-consume-check'], {
      recommended: true,
      type: RuleType[ruleset.rules['operation-formData-consume-check'].type],
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
    expect(results.length).toEqual(0);
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

    expect(results).toEqual([
      {
        code: 'operation-formData-consume-check',
        message:
          'Operations with an `in: formData` parameter must include `application/x-www-form-urlencoded` or `multipart/form-data` in their `consumes` property.',
        path: ['paths', '/path1', 'get'],
        range: {
          end: {
            character: 26,
            line: 10,
          },
          start: {
            character: 12,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
