import { cloneDeep } from 'lodash';

import { buildTestSpectralWithAsyncApiRule } from '../../../../setupTests';
import { Spectral } from '../../../spectral';
import { IRunRule } from '../../../types';

const ruleName = 'asyncapi-schema-default';
let s: Spectral;
let rule: IRunRule;

describe(`Rule '${ruleName}'`, () => {
  beforeEach(async () => {
    [s, rule] = await buildTestSpectralWithAsyncApiRule(ruleName);
  });

  const doc: any = {
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

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if components.schemas.{schema}.default is not valid against the schema it decorates', async () => {
    const clone = cloneDeep(doc);

    clone.components.schemas.aSchema.type = 'string';

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: '`default` property type should be string',
        path: ['components', 'schemas', 'aSchema', 'default'],
        severity: rule.severity,
      }),
    ]);
  });

  test('return result if components.parameters.{parameter}.schema.default is not valid against the schema it decorates', async () => {
    const clone = cloneDeep(doc);

    clone.components.parameters.orphanParameter.schema.type = 'string';

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: '`default` property type should be string',
        path: ['components', 'parameters', 'orphanParameter', 'schema', 'default'],
        severity: rule.severity,
      }),
    ]);
  });

  test('return result if channels.{channel}.parameters.{parameter}.schema.default is not valid against the schema it decorates', async () => {
    const clone = cloneDeep(doc);

    clone.channels['users/{userId}/signedUp'].parameters.userId.schema.type = 'string';
    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: '`default` property type should be string',
        path: ['channels', 'users/{userId}/signedUp', 'parameters', 'userId', 'schema', 'default'],
        severity: rule.severity,
      }),
    ]);
  });
});
