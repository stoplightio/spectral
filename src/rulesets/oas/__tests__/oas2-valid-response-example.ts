import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';
import { setFunctionContext } from '../../evaluators';
import { functions } from '../../../functions';
import oasExample from '../functions/oasExample';

describe('oas2-valid-response-example', () => {
  let s: Spectral;

  beforeEach(() => {
    s = new Spectral();
    s.registerFormat('oas2', () => true);
    s.setFunctions({ oasExample: setFunctionContext({ functions }, oasExample) });
    s.setRules({
      'oas2-valid-response-example': Object.assign(ruleset.rules['oas2-valid-response-example'], {
        recommended: true,
        type: RuleType[ruleset.rules['oas2-valid-parameter-example'].type],
      }),
    });
  });

  test('will pass when examples are valid', async () => {
    const results = await s.run({
      responses: {
        200: {
          schema: {
            type: 'string',
          },
          examples: {
            'application/json': 'test',
            'application/yaml': '',
          },
        },
      },
    });
    expect(results).toHaveLength(0);
  });

  test('will fail when example is invalid', async () => {
    const results = await s.run({
      responses: {
        200: {
          schema: {
            type: 'string',
          },
          examples: {
            'application/json': 'test',
            'application/yaml': 2,
          },
        },
      },
    });
    expect(results).toEqual([
      expect.objectContaining({
        code: 'oas2-valid-response-example',
        message: '`application/yaml` property type should be string',
        severity: DiagnosticSeverity.Error,
        path: ['responses', '200', 'examples', 'application/yaml'],
      }),
    ]);
  });
});
