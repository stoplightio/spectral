import { DiagnosticSeverity } from '@stoplight/types';
import produce from 'immer';
import testRule from './__helpers__/tester';

const document = {
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

testRule('asyncapi-schema-examples', [
  {
    name: 'valid case',
    document,
    errors: [],
  },

  {
    name: 'components.schemas.{schema}.examples.{position} is not valid against the schema it decorates',
    document: produce(document, (draft: any) => {
      draft.components.schemas.aSchema.type = 'string';
    }),
    errors: [
      {
        message: '"0" property type must be string',
        path: ['components', 'schemas', 'aSchema', 'examples', '0'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '"2" property type must be string',
        path: ['components', 'schemas', 'aSchema', 'examples', '2'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'components.parameters.{parameter}.schema.examples.{position} is not valid against the schema it decorates',
    document: produce(document, (draft: any) => {
      draft.components.parameters.orphanParameter.schema.type = 'string';
    }),
    errors: [
      {
        message: '"0" property type must be string',
        path: ['components', 'parameters', 'orphanParameter', 'schema', 'examples', '0'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '"2" property type must be string',
        path: ['components', 'parameters', 'orphanParameter', 'schema', 'examples', '2'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'channels.{channel}.parameters.{parameter}.schema.examples.{position} is not valid against the schema it decorates',
    document: produce(document, (draft: any) => {
      draft.channels['users/{userId}/signedUp'].parameters.userId.schema.type = 'string';
    }),
    errors: [
      {
        message: '"0" property type must be string',
        path: ['channels', 'users/{userId}/signedUp', 'parameters', 'userId', 'schema', 'examples', '0'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '"2" property type must be string',
        path: ['channels', 'users/{userId}/signedUp', 'parameters', 'userId', 'schema', 'examples', '2'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
