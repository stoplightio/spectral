import type { Spectral } from '../../../spectral';
import { loadRules } from './__helpers__/loadRules';
import { DiagnosticSeverity } from '@stoplight/types/';

const ruleName = 'asyncapi-parameter-description';

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
              description: 'The identifier of the user being tracked.',
            },
          },
        },
      },
      components: {
        parameters: {
          orphanParameter: {
            description: 'A defined, but orphaned, parameter.',
          },
        },
      },
    };
  });

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if channels.{channel}.parameters.{parameter} lack a description', async () => {
    delete doc.channels['users/{userId}/signedUp'].parameters.userId.description;

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Parameter objects should have a `description`.',
        path: ['channels', 'users/{userId}/signedUp', 'parameters', 'userId'],
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });

  test('return result if components.parameters.{parameter} lack a description', async () => {
    delete doc.components.parameters.orphanParameter.description;

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Parameter objects should have a `description`.',
        path: ['components', 'parameters', 'orphanParameter'],
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });
});
