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

testRule('asyncapi-schema-default', [
  {
    name: 'valid case',
    document,
    errors: [],
  },

  {
    name: 'components.schemas.{schema}.default is not valid against the schema it decorates',
    document: produce(document, (draft: any) => {
      draft.components.schemas.aSchema.type = 'string';
    }),
    errors: [
      {
        message: '`default` property type must be string',
        path: ['components', 'schemas', 'aSchema', 'default'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'components.parameters.{parameter}.schema.default is not valid against the schema it decorates',
    document: produce(document, (draft: any) => {
      draft.components.parameters.orphanParameter.schema.type = 'string';
    }),
    errors: [
      {
        message: '`default` property type must be string',
        path: ['components', 'parameters', 'orphanParameter', 'schema', 'default'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'channels.{channel}.parameters.{parameter}.schema.default is not valid against the schema it decorates',
    document: produce(document, (draft: any) => {
      draft.channels['users/{userId}/signedUp'].parameters.userId.schema.type = 'string';
    }),
    errors: [
      {
        message: '`default` property type must be string',
        path: ['channels', 'users/{userId}/signedUp', 'parameters', 'userId', 'schema', 'default'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
