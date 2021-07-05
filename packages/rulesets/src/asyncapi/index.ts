import { asyncApi2 } from '@stoplight/spectral-formats';
import {
  truthy,
  pattern,
  unreferencedReusableObject,
  schema,
  undefined,
  alphabetical,
} from '@stoplight/spectral-functions';

import asyncApi2SchemaValidation from './functions/asyncApi2SchemaValidation';
import asyncApi2PayloadValidation from './functions/asyncApi2PayloadValidation';
import * as asyncApi2Schema from './schemas/schema.asyncapi2.json';

export default {
  documentationUrl: 'https://meta.stoplight.io/docs/spectral/docs/reference/asyncapi-rules.md',
  formats: [asyncApi2],
  rules: {
    'asyncapi-channel-no-empty-parameter': {
      description: 'Channel path must not have empty parameter substitution pattern.',
      recommended: true,
      type: 'style',
      given: '$.channels.*~',
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '{}',
        },
      },
    },
    'asyncapi-channel-no-query-nor-fragment': {
      description: 'Channel path must not include query ("?") or fragment ("#") delimiter.',
      recommended: true,
      type: 'style',
      given: '$.channels.*~',
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '[\\?#]',
        },
      },
    },
    'asyncapi-channel-no-trailing-slash': {
      description: 'Channel path must not end with slash.',
      recommended: true,
      type: 'style',
      given: '$.channels.*~',
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '.+\\/$',
        },
      },
    },
    'asyncapi-headers-schema-type-object': {
      description: 'Headers schema type must be "object".',
      message: 'Headers schema type must be "object" ({{error}}).',
      severity: 'error',
      recommended: true,
      type: 'validation',
      given: [
        '$.components.messageTraits.*.headers',
        '$.components.messages.*.headers',
        '$.channels.*.[publish,subscribe].message.headers',
      ],
      then: {
        function: schema,
        functionOptions: {
          allErrors: true,
          schema: {
            type: 'object',
            properties: {
              type: {
                enum: ['object'],
              },
            },
            required: ['type'],
          },
        },
      },
    },
    'asyncapi-info-contact-properties': {
      description: 'Contact object must have "name", "url" and "email".',
      recommended: true,
      type: 'style',
      given: '$.info.contact',
      then: [
        {
          field: 'name',
          function: truthy,
        },
        {
          field: 'url',
          function: truthy,
        },
        {
          field: 'email',
          function: truthy,
        },
      ],
    },
    'asyncapi-info-contact': {
      description: 'Info object must have "contact" object.',
      recommended: true,
      type: 'style',
      given: '$',
      then: {
        field: 'info.contact',
        function: truthy,
      },
    },
    'asyncapi-info-description': {
      description: 'Info "description" must be present and non-empty string.',
      recommended: true,
      type: 'style',
      given: '$',
      then: {
        field: 'info.description',
        function: truthy,
      },
    },
    'asyncapi-info-license-url': {
      description: 'License object must include "url".',
      recommended: false,
      type: 'style',
      given: '$',
      then: {
        field: 'info.license.url',
        function: truthy,
      },
    },
    'asyncapi-info-license': {
      description: 'Info object must have "license" object.',
      recommended: true,
      type: 'style',
      given: '$',
      then: {
        field: 'info.license',
        function: truthy,
      },
    },
    'asyncapi-operation-description': {
      description: 'Operation "description" must be present and non-empty string.',
      recommended: true,
      type: 'style',
      given: ['$.channels.*.[publish,subscribe]'],
      then: {
        field: 'description',
        function: truthy,
      },
    },
    'asyncapi-operation-operationId': {
      description: 'Operation must have "operationId".',
      severity: 'error',
      recommended: true,
      type: 'validation',
      given: ['$.channels.*.[publish,subscribe]'],
      then: {
        field: 'operationId',
        function: truthy,
      },
    },
    'asyncapi-parameter-description': {
      description: 'Parameter objects must have "description".',
      recommended: false,
      type: 'style',
      given: ['$.components.parameters.*', '$.channels.*.parameters.*'],
      then: {
        field: 'description',
        function: truthy,
      },
    },
    'asyncapi-payload-default': {
      description: 'Default must be valid against its defined schema.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      type: 'validation',
      given: [
        '$.components.messageTraits[?(@.schemaFormat === void 0)].payload.default^',
        '$.components.messages[?(@.schemaFormat === void 0)].payload.default^',
        "$.channels.*.[publish,subscribe][?(@property === 'message' && @.schemaFormat === void 0)].payload.default^",
      ],
      then: {
        function: asyncApi2SchemaValidation,
        functionOptions: {
          type: 'default',
        },
      },
    },
    'asyncapi-payload-examples': {
      description: 'Examples must be valid against their defined schema.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      type: 'validation',
      given: [
        '$.components.messageTraits[?(@.schemaFormat === void 0)].payload.examples^',
        '$.components.messages[?(@.schemaFormat === void 0)].payload.examples^',
        "$.channels.*.[publish,subscribe][?(@property === 'message' && @.schemaFormat === void 0)].payload.examples^",
      ],
      then: {
        function: asyncApi2SchemaValidation,
        functionOptions: {
          type: 'examples',
        },
      },
    },
    'asyncapi-payload-unsupported-schemaFormat': {
      description: 'Message schema validation is only supported with default unspecified "schemaFormat".',
      severity: 'info',
      recommended: true,
      type: 'validation',
      given: ['$.components.messageTraits.*', '$.components.messages.*', '$.channels.*.[publish,subscribe].message'],
      then: {
        field: 'schemaFormat',
        function: undefined,
      },
    },
    'asyncapi-payload': {
      description: 'Payloads must be valid against AsyncAPI Schema object.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      type: 'validation',
      given: [
        '$.components.messageTraits[?(@.schemaFormat === void 0)].payload',
        '$.components.messages[?(@.schemaFormat === void 0)].payload',
        "$.channels.*.[publish,subscribe][?(@property === 'message' && @.schemaFormat === void 0)].payload",
      ],
      then: {
        function: asyncApi2PayloadValidation,
      },
    },
    'asyncapi-schema-default': {
      description: 'Default must be valid against its defined schema.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      type: 'validation',
      given: [
        '$.components.schemas.*.default^',
        '$.components.parameters.*.schema.default^',
        '$.channels.*.parameters.*.schema.default^',
      ],
      then: {
        function: asyncApi2SchemaValidation,
        functionOptions: {
          type: 'default',
        },
      },
    },
    'asyncapi-schema-examples': {
      description: 'Examples must be valid against their defined schema.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      type: 'validation',
      given: [
        '$.components.schemas.*.examples^',
        '$.components.parameters.*.schema.examples^',
        '$.channels.*.parameters.*.schema.examples^',
      ],
      then: {
        function: asyncApi2SchemaValidation,
        functionOptions: {
          type: 'examples',
        },
      },
    },
    'asyncapi-schema': {
      description: 'Validate structure of AsyncAPI v2.0.0 Specification.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      type: 'validation',
      given: '$',
      then: {
        function: schema,
        functionOptions: {
          allErrors: true,
          schema: asyncApi2Schema,
        },
      },
    },
    'asyncapi-server-no-empty-variable': {
      description: 'Server URL must not have empty variable substitution pattern.',
      recommended: true,
      type: 'style',
      given: '$.servers[*].url',
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '{}',
        },
      },
    },
    'asyncapi-server-no-trailing-slash': {
      description: 'Server URL must not end with slash.',
      recommended: true,
      type: 'style',
      given: '$.servers[*].url',
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '/$',
        },
      },
    },
    'asyncapi-server-not-example-com': {
      description: 'Server URL must not point at example.com.',
      recommended: false,
      type: 'style',
      given: '$.servers[*].url',
      then: {
        function: pattern,
        functionOptions: {
          notMatch: 'example\\.com',
        },
      },
    },
    'asyncapi-servers': {
      description: 'AsyncAPI object must have non-empty "servers" object.',
      recommended: true,
      type: 'validation',
      given: '$',
      then: {
        field: 'servers',
        function: schema,
        functionOptions: {
          schema: {
            type: 'object',
            minProperties: 1,
          },
          allErrors: true,
        },
      },
    },
    'asyncapi-tag-description': {
      description: 'Tag object must have "description".',
      recommended: false,
      type: 'style',
      given: '$.tags[*]',
      then: {
        field: 'description',
        function: truthy,
      },
    },
    'asyncapi-tags-alphabetical': {
      description: 'AsyncAPI object must have alphabetical "tags".',
      recommended: false,
      type: 'style',
      given: '$',
      then: {
        field: 'tags',
        function: alphabetical,
        functionOptions: {
          keyedBy: 'name',
        },
      },
    },
    'asyncapi-tags': {
      description: 'AsyncAPI object must have non-empty "tags" array.',
      recommended: true,
      type: 'style',
      given: '$',
      then: {
        field: 'tags',
        function: truthy,
      },
    },
    'asyncapi-unused-components-schema': {
      description: 'Potentially unused components schema has been detected.',
      recommended: true,
      type: 'style',
      resolved: false,
      given: '$.components.schemas',
      then: {
        function: unreferencedReusableObject,
        functionOptions: {
          reusableObjectsLocation: '#/components/schemas',
        },
      },
    },
  },
};
