import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas2-discriminator', [
  {
    name: 'valid discriminator',
    document: {
      swagger: '2.0',
      definitions: {
        Pet: {
          type: 'object',
          description: 'Schema with valid discriminator',
          discriminator: 'petType',
          properties: {
            name: {
              type: 'string',
            },
            petType: {
              type: 'string',
            },
          },
          required: ['name', 'petType'],
        },
      },
      Person: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          name: {
            type: 'string',
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'discriminator property not defined',
    document: {
      swagger: '2.0',
      definitions: {
        Pet: {
          type: 'object',
          discriminator: 'petType',
          properties: {
            name: {
              type: 'string',
            },
          },
          required: ['name', 'petType'],
        },
      },
    },
    errors: [
      {
        message: 'The discriminator property must be defined in this schema.',
        path: ['definitions', 'Pet', 'properties'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'discriminator property not required',
    document: {
      swagger: '2.0',
      definitions: {
        Pet: {
          type: 'object',
          discriminator: 'petType',
          properties: {
            name: {
              type: 'string',
            },
            petType: {
              type: 'string',
            },
          },
          required: ['name'],
        },
      },
    },
    errors: [
      {
        message: 'The discriminator property must be in the required property list.',
        path: ['definitions', 'Pet', 'required'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
