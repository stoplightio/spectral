import {
  aas2,
  aas2_0,
  aas2_1,
  aas2_2,
  aas2_3,
  aas2_4,
  aas2_5,
  aas2_6,
  aas3,
  aas3_0,
} from '@stoplight/spectral-formats';
import {
  truthy,
  pattern,
  unreferencedReusableObject,
  schema,
  undefined,
  alphabetical,
} from '@stoplight/spectral-functions';

import asyncApiChannelParameters from './functions/asyncApiChannelParameters';
import asyncApi2ChannelServers from './functions/asyncApi2ChannelServers';
import { asyncApiDocumentSchema } from './functions/asyncApiDocumentSchema';
import asyncApi2MessageExamplesValidation from './functions/asyncApi2MessageExamplesValidation';
import asyncApi2MessageIdUniqueness from './functions/asyncApi2MessageIdUniqueness';
import asyncApi2OperationIdUniqueness from './functions/asyncApi2OperationIdUniqueness';
import asyncApiSchemaValidation from './functions/asyncApiSchemaValidation';
import asyncApiPayloadValidation from './functions/asyncApiPayloadValidation';
import serverVariables from '../shared/functions/serverVariables';
import { uniquenessTags } from '../shared/functions';
import asyncApiSecurity from './functions/asyncApiSecurity';
import { latestVersion } from './functions/utils/specs';

export default {
  documentationUrl: 'https://meta.stoplight.io/docs/spectral/docs/reference/asyncapi-rules.md',
  formats: [aas2_0, aas2_1, aas2_2, aas2_3, aas2_4, aas2_5, aas2_6, aas3_0],
  rules: {
    'asyncapi-channel-no-empty-parameter': {
      description: 'Channel path must not have empty parameter substitution pattern.',
      recommended: true,
      given: '$.channels',
      formats: [aas2],
      then: {
        field: '@key',
        function: pattern,
        functionOptions: {
          notMatch: '{}',
        },
      },
    },
    'asyncapi-3-channel-no-empty-parameter': {
      description: 'Channel address must not have empty parameter substitution pattern.',
      recommended: true,
      given: '$.channels.*',
      formats: [aas3],
      then: {
        field: 'address',
        function: pattern,
        functionOptions: {
          notMatch: '{}',
        },
      },
    },
    'asyncapi-channel-no-query-nor-fragment': {
      description: 'Channel path must not include query ("?") or fragment ("#") delimiter.',
      recommended: true,
      given: '$.channels',
      formats: [aas2],
      then: {
        field: '@key',
        function: pattern,
        functionOptions: {
          notMatch: '[\\?#]',
        },
      },
    },
    'asyncapi-3-channel-no-query-nor-fragment': {
      description: 'Channel address must not include query ("?") or fragment ("#") delimiter.',
      recommended: true,
      given: '$.channels.*',
      formats: [aas3],
      then: {
        field: 'address',
        function: pattern,
        functionOptions: {
          notMatch: '[\\?#]',
        },
      },
    },
    'asyncapi-channel-no-trailing-slash': {
      description: 'Channel path must not end with slash.',
      recommended: true,
      given: '$.channels',
      formats: [aas2],
      then: {
        field: '@key',
        function: pattern,
        functionOptions: {
          notMatch: '.+\\/$',
        },
      },
    },
    'asyncapi-3-channel-no-trailing-slash': {
      description: 'Channel address must not end with slash.',
      recommended: true,
      given: '$.channels.*',
      formats: [aas3],
      then: {
        field: 'address',
        function: pattern,
        functionOptions: {
          notMatch: '.+\\/$',
        },
      },
    },
    'asyncapi-channel-parameters': {
      description: 'Channel parameters must be defined and there must be no redundant parameters.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      formats: [aas2, aas3],
      given: ['$.channels.*', '$.components.channels.*'],
      then: {
        function: asyncApiChannelParameters,
      },
    },
    'asyncapi-channel-servers': {
      description: 'Channel servers must be defined in the "servers" object.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      formats: [aas2],
      given: '$',
      then: {
        function: asyncApi2ChannelServers,
      },
    },
    'asyncapi-3-channel-servers': {
      description: 'Channel servers must be defined in the "servers" object.',
      severity: 'error',
      recommended: true,
      resolved: false, // We use the JSON pointer to match the channel.
      given: '$.channels.*',
      formats: [aas3],
      then: {
        field: '$.servers.*.$ref',
        function: pattern,
        functionOptions: {
          match: '#\\/servers\\/', // If doesn't match, rule fails.
        },
      },
    },
    'asyncapi-headers-schema-type-object': {
      description: 'Headers schema type must be "object".',
      message: 'Headers schema type must be "object" ({{error}}).',
      severity: 'error',
      recommended: true,
      formats: [aas2],
      given: [
        '$.components.messageTraits.*.headers',
        '$.components.messages.*.headers',
        '$.channels.*.[publish,subscribe].message.headers',
        '$.channels.*.[publish,subscribe].message.traits[*].headers',
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
    'asyncapi-3-headers-schema-type-object': {
      description: 'Headers schema type must be "object".',
      message: 'Headers schema type must be "object" ({{error}}).',
      severity: 'error',
      recommended: true,
      formats: [aas3],
      given: [
        '$.components.messageTraits.*.headers',
        '$.components.messages.*.headers',
        '$.channels.*.messages.*.headers',
        '$.channels.*.messages.*.traits[*].headers',
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
      given: '$.info.contact',
      formats: [aas2, aas3],
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
      formats: [aas2, aas3],
      given: '$',
      then: {
        field: 'info.contact',
        function: truthy,
      },
    },
    'asyncapi-info-description': {
      description: 'Info "description" must be present and non-empty string.',
      recommended: true,
      given: '$',
      formats: [aas2, aas3],
      then: {
        field: 'info.description',
        function: truthy,
      },
    },
    'asyncapi-info-license-url': {
      description: 'License object must include "url".',
      recommended: false,
      given: '$',
      formats: [aas2, aas3],
      then: {
        field: 'info.license.url',
        function: truthy,
      },
    },
    'asyncapi-info-license': {
      description: 'Info object must have "license" object.',
      recommended: true,
      given: '$',
      formats: [aas2, aas3],
      then: {
        field: 'info.license',
        function: truthy,
      },
    },
    'asyncapi-latest-version': {
      description: 'Checking if the AsyncAPI document is using the latest version.',
      message: `The latest version is not used. You should update to the "${latestVersion}" version.`,
      recommended: true,
      severity: 'info',
      given: '$.asyncapi',
      formats: [aas2, aas3],
      then: {
        function: schema,
        functionOptions: {
          schema: {
            const: latestVersion,
          },
        },
      },
    },
    'asyncapi-message-examples': {
      description: 'Examples of message object should follow by "payload" and "headers" schemas.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      formats: [aas2],
      given: [
        // messages
        '$.channels.*.[publish,subscribe].message',
        '$.channels.*.[publish,subscribe].message.oneOf.*',
        '$.components.channels.*.[publish,subscribe].message',
        '$.components.channels.*.[publish,subscribe].message.oneOf.*',
        '$.components.messages.*',
        // message traits
        '$.channels.*.[publish,subscribe].message.traits.*',
        '$.channels.*.[publish,subscribe].message.oneOf.*.traits.*',
        '$.components.channels.*.[publish,subscribe].message.traits.*',
        '$.components.channels.*.[publish,subscribe].message.oneOf.*.traits.*',
        '$.components.messages.*.traits.*',
        '$.components.messageTraits.*',
      ],
      then: {
        function: asyncApi2MessageExamplesValidation,
      },
    },
    'asyncapi-message-messageId-uniqueness': {
      description: '"messageId" must be unique across all the messages.',
      severity: 'error',
      recommended: true,
      given: '$',
      formats: [aas2],
      then: {
        function: asyncApi2MessageIdUniqueness,
      },
    },
    'asyncapi-operation-description': {
      description: 'Operation "description" must be present and non-empty string.',
      recommended: true,
      formats: [aas2],
      given: '$.channels[*][publish,subscribe]',
      then: {
        field: 'description',
        function: truthy,
      },
    },
    'asyncapi-3-operation-description': {
      description: 'Operation "description" must be present and non-empty string.',
      recommended: true,
      formats: [aas3],
      given: '$.operations.*',
      then: {
        field: 'description',
        function: truthy,
      },
    },
    'asyncapi-operation-operationId-uniqueness': {
      description: '"operationId" must be unique across all the operations.',
      severity: 'error',
      recommended: true,
      formats: [aas2],
      given: '$',
      then: {
        function: asyncApi2OperationIdUniqueness,
      },
    },
    'asyncapi-operation-operationId': {
      description: 'Operation must have "operationId".',
      severity: 'error',
      recommended: true,
      formats: [aas2],
      given: '$.channels[*][publish,subscribe]',
      then: {
        field: 'operationId',
        function: truthy,
      },
    },
    'asyncapi-operation-security': {
      description: 'Operation have to reference a defined security schemes.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      formats: [aas2],
      given: '$.channels[*][publish,subscribe].security.*',
      then: {
        function: asyncApiSecurity,
        functionOptions: {
          objectType: 'Operation',
        },
      },
    },
    'asyncapi-3-operation-security': {
      description: 'Operation have to reference a defined security schemes.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      formats: [aas3],
      given: '$.operations.*.security.*',
      then: {
        function: asyncApiSecurity,
        functionOptions: {
          objectType: 'Operation',
        },
      },
    },
    'asyncapi-parameter-description': {
      description: 'Parameter objects must have "description".',
      recommended: false,
      formats: [aas2, aas3],
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
      formats: [aas2],
      given: [
        '$.components.messageTraits[?(@.schemaFormat === void 0)].payload.default^',
        '$.components.messages[?(@.schemaFormat === void 0)].payload.default^',
        "$.channels[*][publish,subscribe][?(@property === 'message' && @.schemaFormat === void 0)].payload.default^",
      ],
      then: {
        function: asyncApiSchemaValidation,
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
      formats: [aas2],
      given: [
        '$.components.messageTraits[?(@.schemaFormat === void 0)].payload.examples^',
        '$.components.messages[?(@.schemaFormat === void 0)].payload.examples^',
        "$.channels[*][publish,subscribe][?(@property === 'message' && @.schemaFormat === void 0)].payload.examples^",
      ],
      then: {
        function: asyncApiSchemaValidation,
        functionOptions: {
          type: 'examples',
        },
      },
    },
    'asyncapi-payload-unsupported-schemaFormat': {
      description: 'Message schema validation is only supported with default unspecified "schemaFormat".',
      severity: 'info',
      recommended: true,
      formats: [aas2],
      given: ['$.components.messageTraits.*', '$.components.messages.*', '$.channels[*][publish,subscribe].message'],
      then: {
        field: 'schemaFormat',
        function: undefined,
      },
    },
    'asyncapi-3-payload-unsupported-schemaFormat': {
      description: 'Message schema validation is only supported with default unspecified "schemaFormat".',
      severity: 'info',
      recommended: true,
      formats: [aas3],
      given: ['$.components.messages.*.payload', '$.channels.*.messages.*.payload'],
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
      formats: [aas2],
      given: [
        '$.components.messageTraits[?(@.schemaFormat === void 0)].payload',
        '$.components.messages[?(@.schemaFormat === void 0)].payload',
        "$.channels[*][publish,subscribe][?(@property === 'message' && @.schemaFormat === void 0)].payload",
      ],
      then: {
        function: asyncApiPayloadValidation,
      },
    },
    'asyncapi-schema-default': {
      description: 'Default must be valid against its defined schema.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      formats: [aas2],
      given: [
        '$.components.schemas.*.default^',
        '$.components.parameters.*.schema.default^',
        '$.channels.*.parameters.*.schema.default^',
      ],
      then: {
        function: asyncApiSchemaValidation,
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
      formats: [aas2],
      given: [
        '$.components.schemas.*.examples^',
        '$.components.parameters.*.schema.examples^',
        '$.channels.*.parameters.*.schema.examples^',
      ],
      then: {
        function: asyncApiSchemaValidation,
        functionOptions: {
          type: 'examples',
        },
      },
    },
    'asyncapi-schema': {
      description: 'Validate structure of AsyncAPI specification.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      formats: [aas2],
      given: '$',
      then: {
        function: asyncApiDocumentSchema,
        functionOptions: {
          resolved: true,
        },
      },
    },
    'asyncapi-server-variables': {
      description: 'Server variables must be defined and there must be no redundant variables.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      formats: [aas2],
      given: ['$.servers.*', '$.components.servers.*'],
      then: {
        function: serverVariables,
      },
    },
    'asyncapi-server-no-empty-variable': {
      description: 'Server URL must not have empty variable substitution pattern.',
      recommended: true,
      formats: [aas2],
      given: '$.servers[*].url',
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '{}',
        },
      },
    },
    'asyncapi-3-server-no-empty-variable': {
      description: 'Server host and pathname must not have empty variable substitution pattern.',
      recommended: true,
      formats: [aas3],
      given: ['$.servers[*].host', '$.servers[*].pathname'],
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
      formats: [aas2],
      given: '$.servers[*].url',
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '/$',
        },
      },
    },
    'asyncapi-3-server-no-trailing-slash': {
      description: 'Server host must not end with slash.',
      recommended: true,
      formats: [aas3],
      given: '$.servers.*.host',
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
      given: '$.servers[*].url',
      formats: [aas2],
      then: {
        function: pattern,
        functionOptions: {
          notMatch: 'example\\.com',
        },
      },
    },
    'asyncapi-3-server-not-example-com': {
      description: 'Server host must not point at example.com.',
      recommended: false,
      given: '$.servers.*.host',
      formats: [aas3],
      then: {
        function: pattern,
        functionOptions: {
          notMatch: 'example\\.com',
        },
      },
    },
    'asyncapi-server-security': {
      description: 'Server have to reference a defined security schemes.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      formats: [aas2],
      given: '$.servers.*.security.*',
      then: {
        function: asyncApiSecurity,
        functionOptions: {
          objectType: 'Server',
        },
      },
    },
    'asyncapi-servers': {
      description: 'AsyncAPI object must have non-empty "servers" object.',
      recommended: true,
      formats: [aas2, aas3],
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
      formats: [aas2],
      given: '$.tags[*]',
      then: {
        field: 'description',
        function: truthy,
      },
    },
    'asyncapi-3-tag-description': {
      description: 'Tag object must have "description".',
      recommended: false,
      formats: [aas3],
      given: '$.info.tags[*]',
      then: {
        field: 'description',
        function: truthy,
      },
    },
    'asyncapi-tags-alphabetical': {
      description: 'AsyncAPI object must have alphabetical "tags".',
      recommended: false,
      given: '$',
      formats: [aas2],
      then: {
        field: 'tags',
        function: alphabetical,
        functionOptions: {
          keyedBy: 'name',
        },
      },
    },
    'asyncapi-3-tags-alphabetical': {
      description: 'AsyncAPI object must have alphabetical "tags".',
      recommended: false,
      given: '$.info',
      formats: [aas3],
      then: {
        field: 'tags',
        function: alphabetical,
        functionOptions: {
          keyedBy: 'name',
        },
      },
    },
    'asyncapi-tags-uniqueness': {
      description: 'Each tag must have a unique name.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      formats: [aas2],
      given: [
        // root
        '$.tags',
        // servers
        '$.servers.*.tags',
        '$.components.servers.*.tags',
        // operations
        '$.channels.*.[publish,subscribe].tags',
        '$.components.channels.*.[publish,subscribe].tags',
        // operation traits
        '$.channels.*.[publish,subscribe].traits.*.tags',
        '$.components.channels.*.[publish,subscribe].traits.*.tags',
        '$.components.operationTraits.*.tags',
        // messages
        '$.channels.*.[publish,subscribe].message.tags',
        '$.channels.*.[publish,subscribe].message.oneOf.*.tags',
        '$.components.channels.*.[publish,subscribe].message.tags',
        '$.components.channels.*.[publish,subscribe].message.oneOf.*.tags',
        '$.components.messages.*.tags',
        // message traits
        '$.channels.*.[publish,subscribe].message.traits.*.tags',
        '$.channels.*.[publish,subscribe].message.oneOf.*.traits.*.tags',
        '$.components.channels.*.[publish,subscribe].message.traits.*.tags',
        '$.components.channels.*.[publish,subscribe].message.oneOf.*.traits.*.tags',
        '$.components.messages.*.traits.*.tags',
        '$.components.messageTraits.*.tags',
      ],
      then: {
        function: uniquenessTags,
      },
    },
    'asyncapi-3-tags-uniqueness': {
      description: 'Each tag must have a unique name.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      formats: [aas3],
      given: [
        // root
        '$.info.tags',
        // servers
        '$.servers.*.tags',
        '$.components.servers.*.tags',
        // operations
        '$.operations.*.tags',
        '$.components.operations.*.tags',
        // operation traits
        '$.operations.*.traits.*.tags',
        '$.components.operations.traits.*.tags',
        '$.components.operationTraits.*.tags',
        // messages
        '$.channels.*.messages.*.tags',
        '$.components.channels.*.messages.tags',
        '$.components.messages.*.tags',
        // message traits
        '$.channels.*..messages.*.traits.*.tags',
        '$.components.channels.*.messages.*.traits.*.tags',
        '$.components.messages.*.traits.*.tags',
        '$.components.messageTraits.*.tags',
      ],
      then: {
        function: uniquenessTags,
      },
    },
    'asyncapi-tags': {
      description: 'AsyncAPI object must have non-empty "tags" array.',
      recommended: true,
      formats: [aas2],
      given: '$',
      then: {
        field: 'tags',
        function: truthy,
      },
    },
    'asyncapi-3-tags': {
      description: 'AsyncAPI document must have non-empty "tags" array.',
      recommended: true,
      formats: [aas3],
      given: ['$.info'],
      then: {
        field: 'tags',
        function: truthy,
      },
    },
    'asyncapi-unused-components-schema': {
      description: 'Potentially unused components schema has been detected.',
      recommended: true,
      resolved: false,
      formats: [aas2, aas3],
      given: '$.components.schemas',
      then: {
        function: unreferencedReusableObject,
        functionOptions: {
          reusableObjectsLocation: '#/components/schemas',
        },
      },
    },
    'asyncapi-unused-components-server': {
      description: 'Potentially unused components server has been detected.',
      recommended: true,
      resolved: false,
      formats: [aas2, aas3],
      given: '$.components.servers',
      then: {
        function: unreferencedReusableObject,
        functionOptions: {
          reusableObjectsLocation: '#/components/servers',
        },
      },
    },
    'asyncapi-3-document-resolved': {
      description: 'Checking if the AsyncAPI v3 document has valid structure after resolving references.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      given: '$',
      formats: [aas3],
      then: {
        function: asyncApiDocumentSchema,
        functionOptions: {
          resolved: true,
        },
      },
    },
    'asyncapi-3-document-unresolved': {
      description: 'Checking if the AsyncAPI v3 document has valid structure before resolving references.',
      message: '{{error}}',
      severity: 'error',
      recommended: true,
      resolved: false,
      given: '$',
      formats: [aas3],
      then: {
        function: asyncApiDocumentSchema,
        functionOptions: {
          resolved: false,
        },
      },
    },
  },
};
