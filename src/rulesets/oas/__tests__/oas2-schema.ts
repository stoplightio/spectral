import { functions } from '../../../functions';
import { RuleType, Spectral } from '../../../spectral';
import { setFunctionContext } from '../../evaluators';
import oasDocumentSchema from '../functions/oasDocumentSchema';
import * as ruleset from '../index.json';
import * as oas2Schema from '../schemas/schema.oas2.json';

describe('oas2-schema', () => {
  let s: Spectral;

  beforeEach(() => {
    s = new Spectral();
    s.registerFormat('oas2', () => true);
    s.setFunctions({ oasDocumentSchema: setFunctionContext({ functions }, oasDocumentSchema) });
    s.setRules({
      'oas2-schema': Object.assign({}, ruleset.rules['oas2-schema'], {
        recommended: true,
        type: RuleType[ruleset.rules['oas2-schema'].type],
        then: {
          ...ruleset.rules['oas2-schema'].then,
          functionOptions: {
            ...ruleset.rules['oas2-schema'].then.functionOptions,
            schema: oas2Schema,
          },
        },
      }),
    });
  });

  test('annotates with correct paths', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/test': {
          get: {},
        },
      },
      schemes: ['http'],
      info: {
        title: 'Test',
        version: '1.0.0',
      },
    });
    expect(results).toEqual([
      {
        code: 'oas2-schema',
        message: `\`get\` property should have required property \`responses\`.`,
        path: ['paths', '/test', 'get'],
        range: {
          end: {
            character: 15,
            line: 4,
          },
          start: {
            character: 12,
            line: 4,
          },
        },
        severity: 0,
      },
    ]);
  });
});
