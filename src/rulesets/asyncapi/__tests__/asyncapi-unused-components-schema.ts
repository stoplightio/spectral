import { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';
import { DiagnosticSeverity } from '@stoplight/types';

const ruleName = 'asyncapi-unused-components-schema';

describe(`Rule '${ruleName}'`, () => {
  let s: Spectral;
  let doc: any;

  beforeEach(async () => {
    s = await createWithRules([ruleName]);

    doc = {
      asyncapi: '2.0.0',
      channels: {
        'users/signedUp': {
          subscribe: {
            message: {
              payload: {
                $ref: '#/components/schemas/externallyDefinedUser',
              },
            },
          },
        },
      },
      components: {
        schemas: {
          externallyDefinedUser: {
            type: 'string',
          },
        },
      },
    };
  });

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if components.schemas contains unreferenced objects', async () => {
    delete doc.channels['users/signedUp'];

    doc.channels['users/signedOut'] = {
      subscribe: {
        message: {
          payload: {
            type: 'string',
          },
        },
      },
    };

    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Potentially unused components schema has been detected.',
        path: ['components', 'schemas', 'externallyDefinedUser'],
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });
});
