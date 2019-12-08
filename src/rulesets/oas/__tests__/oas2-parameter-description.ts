import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import testParameterDescription from '../../__tests__/shared/_parameter-description';
import * as ruleset from '../index.json';

describe('oas2-parameter-description', () => {
  const s = new Spectral();
  s.registerFormat('oas2', () => true);
  s.setRules({
    'oas2-parameter-description': Object.assign(ruleset.rules['oas2-parameter-description'], {
      recommended: true,
      type: RuleType[ruleset.rules['oas2-parameter-description'].type],
    }),
  });

  testParameterDescription(s, 2);

  test('return errors if shared level parameter description is missing', async () => {
    const results = await s.run({
      swagger: '2.0',
      parameters: {
        limit: {
          name: 'limit',
          in: 'query',
          type: 'integer',
        },
      },
    });
    expect(results).toEqual([
      expect.objectContaining({
        code: 'oas2-parameter-description',
        message: 'Parameter objects should have a `description`.',
        path: ['parameters', 'limit'],
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });
});
