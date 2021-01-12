import type { Spectral } from '../../../spectral';
import { loadRules } from './__helpers__/loadRules';
import { DiagnosticSeverity } from '@stoplight/types';

const ruleName = 'asyncapi-schema-examples';

describe(`Rule '${ruleName}'`, () => {
  let s: Spectral;
  let doc: any;

  beforeEach(async () => {
    s = await loadRules([ruleName]);

    doc = {
      asyncapi: '2.0.0',
      channels: {
        'users/{userId}/signedUp': {
          parameters: {
            userId: {
              schema: {
                examples: [17, 'one', 13],
              },
            },
          },
        },
      },
      components: {
        parameters: {
          orphanParameter: {
            schema: {
              examples: [17, 'one', 13],
            },
          },
        },
        schemas: {
          aSchema: {
            examples: [17, 'one', 13],
          },
        },
      },
    };
  });

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if components.schemas.{schema}.examples.{position} is not valid against the schema it decorates', async () => {
    doc.components.schemas.aSchema.type = 'string';

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: '`0` property type should be string',
        path: ['components', 'schemas', 'aSchema', 'examples', '0'],
        severity: DiagnosticSeverity.Error,
      }),
      expect.objectContaining({
        code: ruleName,
        message: '`2` property type should be string',
        path: ['components', 'schemas', 'aSchema', 'examples', '2'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('return result if components.parameters.{parameter}.schema.examples.{position} is not valid against the schema it decorates', async () => {
    doc.components.parameters.orphanParameter.schema.type = 'string';

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: '`0` property type should be string',
        path: ['components', 'parameters', 'orphanParameter', 'schema', 'examples', '0'],
        severity: DiagnosticSeverity.Error,
      }),
      expect.objectContaining({
        code: ruleName,
        message: '`2` property type should be string',
        path: ['components', 'parameters', 'orphanParameter', 'schema', 'examples', '2'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('return result if channels.{channel}.parameters.{parameter}.schema.examples.{position} is not valid against the schema it decorates', async () => {
    doc.channels['users/{userId}/signedUp'].parameters.userId.schema.type = 'string';
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: '`0` property type should be string',
        path: ['channels', 'users/{userId}/signedUp', 'parameters', 'userId', 'schema', 'examples', '0'],
        severity: DiagnosticSeverity.Error,
      }),
      expect.objectContaining({
        code: ruleName,
        message: '`2` property type should be string',
        path: ['channels', 'users/{userId}/signedUp', 'parameters', 'userId', 'schema', 'examples', '2'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });
});
