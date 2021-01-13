import type { Spectral } from '../../../spectral';
import { DiagnosticSeverity } from '@stoplight/types';
import { createWithRules } from './__helpers__/createWithRules';

const ruleName = 'asyncapi-schema-default';

describe(`Rule '${ruleName}'`, () => {
  let s: Spectral;
  let doc: any;

  beforeEach(async () => {
    s = await createWithRules([ruleName]);

    doc = {
      asyncapi: '2.0.0',
      channels: {
        'users/{userId}/signedUp': {
          parameters: {
            userId: {
              schema: {
                default: 17,
              },
            },
          },
        },
      },
      components: {
        parameters: {
          orphanParameter: {
            schema: {
              default: 17,
            },
          },
        },
        schemas: {
          aSchema: {
            default: 17,
          },
        },
      },
    };
  });

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if components.schemas.{schema}.default is not valid against the schema it decorates', async () => {
    doc.components.schemas.aSchema.type = 'string';

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: '`default` property type should be string',
        path: ['components', 'schemas', 'aSchema', 'default'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('return result if components.parameters.{parameter}.schema.default is not valid against the schema it decorates', async () => {
    doc.components.parameters.orphanParameter.schema.type = 'string';

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: '`default` property type should be string',
        path: ['components', 'parameters', 'orphanParameter', 'schema', 'default'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('return result if channels.{channel}.parameters.{parameter}.schema.default is not valid against the schema it decorates', async () => {
    doc.channels['users/{userId}/signedUp'].parameters.userId.schema.type = 'string';
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: '`default` property type should be string',
        path: ['channels', 'users/{userId}/signedUp', 'parameters', 'userId', 'schema', 'default'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });
});
