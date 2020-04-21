import { cloneDeep } from 'lodash';

import { buildTestSpectralWithAsyncApiRule } from '../../../../setupTests';
import { Spectral } from '../../../spectral';
import { IRunRule } from '../../../types';

const ruleName = 'asyncapi-unused-components-schema';
let s: Spectral;
let rule: IRunRule;

describe(`Rule '${ruleName}'`, () => {
  beforeEach(async () => {
    [s, rule] = await buildTestSpectralWithAsyncApiRule(ruleName);
  });

  const doc: any = {
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

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if components.schemas contains unreferenced objects', async () => {
    const clone = cloneDeep(doc);

    delete clone.channels['users/signedUp'];

    clone.channels['users/signedOut'] = {
      subscribe: {
        message: {
          payload: {
            type: 'string',
          },
        },
      },
    };

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: 'Potentially unused components schema has been detected.',
        path: ['components', 'schemas', 'externallyDefinedUser'],
        severity: rule.severity,
      }),
    ]);
  });
});
