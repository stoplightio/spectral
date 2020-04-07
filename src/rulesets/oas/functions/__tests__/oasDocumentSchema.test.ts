import { isOpenApiv2, isOpenApiv3, RuleType, Spectral } from '../../../..';
import { functions } from '../../../../functions';
import { setFunctionContext } from '../../../evaluators';
import { rules } from '../../index.json';
import oasDocumentSchema from '../oasDocumentSchema';

import { DiagnosticSeverity } from '@stoplight/types/dist';
import * as oas2Schema from '../../schemas/schema.oas2.json';
import * as oas3Schema from '../../schemas/schema.oas3.json';

describe('oasDocumentSchema', () => {
  let s: Spectral;

  beforeEach(() => {
    s = new Spectral();

    s.registerFormat('oas2', isOpenApiv2);
    s.registerFormat('oas3', isOpenApiv3);
    s.setFunctions({ oasDocumentSchema: setFunctionContext({ functions }, oasDocumentSchema) });
    s.setRules({
      'oas2-schema': {
        ...rules['oas2-schema'],
        type: RuleType[rules['oas2-schema'].type],
        then: {
          ...rules['oas2-schema'].then,
          functionOptions: {
            ...rules['oas2-schema'].then.functionOptions,
            schema: oas2Schema,
          },
        },
      },
      'oas3-schema': {
        ...rules['oas3-schema'],
        type: RuleType[rules['oas3-schema'].type],
        then: {
          ...rules['oas3-schema'].then,
          functionOptions: {
            ...rules['oas3-schema'].then.functionOptions,
            schema: oas3Schema,
          },
        },
      },
    });
  });

  describe('given OpenAPI 3 document', () => {
    test('validate responses', async () => {
      expect(
        await s.run({
          openapi: '3.0.1',
          info: {
            title: 'response example',
            version: '1.0',
          },
          paths: {
            '/user': {
              get: {
                operationId: 'd',
                responses: {
                  200: {},
                },
              },
            },
          },
        }),
      ).toEqual([
        {
          code: 'oas3-schema',
          message: '`200` property should have required property `description`',
          path: ['paths', '/user', 'get', 'responses', '200'],
          severity: DiagnosticSeverity.Error,
          range: expect.any(Object),
        },
      ]);
    });
  });
});
