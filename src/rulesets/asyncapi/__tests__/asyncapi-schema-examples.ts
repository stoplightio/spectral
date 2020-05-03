import { cloneDeep } from 'lodash';

import { buildTestSpectralWithAsyncApiRule } from '../../../../setupTests';
import { Rule } from '../../../rule';
import { Spectral } from '../../../spectral';

const ruleName = 'asyncapi-schema-examples';
let s: Spectral;
let rule: Rule;

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

  test('validates a correct object', async () => {
    const results = await s.run(doc, { ignoreUnknownFormat: false });

    expect(results).toEqual([]);
  });

  test('return result if components.schemas.{schema}.examples.{position} is not valid against the schema it decorates', async () => {
    const clone = cloneDeep(doc);

    clone.components.schemas.aSchema.type = 'string';

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: '`0` property type should be string',
        path: ['components', 'schemas', 'aSchema', 'examples', '0'],
        severity: rule.severity,
      }),
      expect.objectContaining({
        code: ruleName,
        message: '`2` property type should be string',
        path: ['components', 'schemas', 'aSchema', 'examples', '2'],
        severity: rule.severity,
      }),
    ]);
  });

  test('return result if components.parameters.{parameter}.schema.examples.{position} is not valid against the schema it decorates', async () => {
    const clone = cloneDeep(doc);

    clone.components.parameters.orphanParameter.schema.type = 'string';

    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: '`0` property type should be string',
        path: ['components', 'parameters', 'orphanParameter', 'schema', 'examples', '0'],
        severity: rule.severity,
      }),
      expect.objectContaining({
        code: ruleName,
        message: '`2` property type should be string',
        path: ['components', 'parameters', 'orphanParameter', 'schema', 'examples', '2'],
        severity: rule.severity,
      }),
    ]);
  });

  test('return result if channels.{channel}.parameters.{parameter}.schema.examples.{position} is not valid against the schema it decorates', async () => {
    const clone = cloneDeep(doc);

    clone.channels['users/{userId}/signedUp'].parameters.userId.schema.type = 'string';
    const results = await s.run(clone, { ignoreUnknownFormat: false });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: '`0` property type should be string',
        path: ['channels', 'users/{userId}/signedUp', 'parameters', 'userId', 'schema', 'examples', '0'],
        severity: rule.severity,
      }),
      expect.objectContaining({
        code: ruleName,
        message: '`2` property type should be string',
        path: ['channels', 'users/{userId}/signedUp', 'parameters', 'userId', 'schema', 'examples', '2'],
        severity: rule.severity,
      }),
    ]);
  });
});
