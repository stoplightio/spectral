import type { createRulesetFunction } from '@stoplight/spectral-core';
import { CasingType } from './types';

type CustomFunctionOptionsSchema = Parameters<typeof createRulesetFunction>[0]['input'];

export const optionSchemas: Record<string, CustomFunctionOptionsSchema> = {
  alphabetical: {
    type: ['object', 'null'],
    properties: {
      keyedBy: {
        type: 'string',
        description: 'key to sort an object by',
      },
    },
    additionalProperties: false,
    errorMessage: {
      type: `"alphabetical" function has invalid options specified. Example valid options: null (no options), { "keyedBy": "my-key" }`,
    },
  },
  casing: {
    required: ['type'],
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: Object.values(CasingType),
        errorMessage: `"casing" function and its "type" option accept the following values: ${Object.values(
          CasingType,
        ).join(', ')}`,
        description: 'the casing type to match against',
      },
      disallowDigits: {
        type: 'boolean',
        default: false,
        description: 'if not true, digits are allowed',
      },
      separator: {
        type: 'object',
        required: ['char'],
        additionalProperties: false,
        properties: {
          char: {
            type: 'string',
            maxLength: 1,
            errorMessage: `"casing" function and its "separator.char" option accepts only char, i.e. "I" or "/"`,
            description: 'additional char to separate groups of words',
          },
          allowLeading: {
            type: 'boolean',
            description: 'can the group separator char be used at the first char?',
          },
        },
      },
    },
    additionalProperties: false,
    errorMessage: {
      type: `"casing" function has invalid options specified. Example valid options: { "type": "camel" }, { "type": "pascal", "disallowDigits": true }`,
    },
  },
  defined: null,
  enumeration: {
    type: 'object',
    additionalProperties: false,
    properties: {
      values: {
        type: 'array',
        items: {
          type: ['string', 'number', 'null', 'boolean'],
        },
        errorMessage:
          '"enumeration" and its "values" option support only arrays of primitive values, i.e. ["Berlin", "London", "Paris"]',
        description: 'an array of possible values',
      },
    },
    required: ['values'],
    errorMessage: {
      type: `"enumeration" function has invalid options specified. Example valid options: { "values": ["Berlin", "London", "Paris"] }, { "values": [2, 3, 5, 8, 13, 21] }`,
    },
  },
  falsy: null,
  length: {
    type: 'object',
    properties: {
      min: {
        type: 'number',
        description: 'the minimum length to match',
      },
      max: {
        type: 'number',
        description: 'the maximum length to match',
      },
    },
    minProperties: 1,
    additionalProperties: false,
    errorMessage: {
      type: `"length" function has invalid options specified. Example valid options: { "min": 2 }, { "max": 5 }, { "min": 0, "max": 10 }`,
    },
  },
  pattern: {
    type: 'object',
    additionalProperties: false,
    properties: {
      match: {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'object',
            properties: {
              exec: {},
              test: {},
              flags: {
                type: 'string',
              },
            },
            required: ['test', 'flags'],
          },
        ],
        errorMessage: `"pattern" function and its "match" option must be string or RegExp instance`,
        description: 'if provided, value must match this regex',
      },
      notMatch: {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'object',
            properties: {
              exec: {},
              test: {},
              flags: {
                type: 'string',
              },
            },
            required: ['test', 'flags'],
          },
        ],
        errorMessage: `"pattern" function and its "notMatch" option must be string or RegExp instance`,
        description: 'if provided, value must _not_ match this regex',
      },
    },
    minProperties: 1,
    errorMessage: {
      type: `"pattern" function has invalid options specified. Example valid options: { "match": "^Stoplight" }, { "notMatch": "Swagger" }, { "match": "Stoplight", "notMatch": "Swagger" }`,
      minProperties: `"pattern" function has invalid options specified. Example valid options: { "match": "^Stoplight" }, { "notMatch": "Swagger" }, { "match": "Stoplight", "notMatch": "Swagger" }`,
    },
  },
  truthy: null,
  undefined: null,
  schema: {
    additionalProperties: false,
    properties: {
      schema: {
        type: 'object',
        description: 'a valid JSON Schema document',
      },
      dialect: {
        enum: ['auto', 'draft4', 'draft6', 'draft7', 'draft2019-09', 'draft2020-12'],
        default: 'auto',
        description: 'the JSON Schema draft used by function',
      },
      allErrors: {
        type: 'boolean',
        default: false,
        description: 'returns all errors when true; otherwise only returns the first error',
      },
      prepareResults: true,
    },
    required: ['schema'],
    type: 'object',
    errorMessage: {
      type: '"schema" function has invalid options specified. Example valid options: { "schema": { /* any JSON Schema can be defined here */ } , { "schema": { "type": "object" }, "dialect": "auto" }',
    },
  },
  unreferencedReusableObject: {
    type: 'object',
    properties: {
      reusableObjectsLocation: {
        type: 'string',
        format: 'json-pointer-uri-fragment',
        errorMessage:
          '"unreferencedReusableObject" and its "reusableObjectsLocation" option support only valid JSON Pointer fragments, i.e. "#", "#/foo", "#/paths/~1user"',
        description:
          'a local json pointer to the document member holding the reusable objects (eg. #/definitions for an OAS2 document, #/components/schemas for an OAS3 document)',
      },
    },
    additionalProperties: false,
    required: ['reusableObjectsLocation'],
    errorMessage: {
      type: '"unreferencedReusableObject" function has invalid options specified. Example valid options: { "reusableObjectsLocation": "#/components/schemas" }, { "reusableObjectsLocation": "#/$defs" }',
      required:
        '"unreferencedReusableObject" function is missing "reusableObjectsLocation" option. Example valid options: { "reusableObjectsLocation": "#/components/schemas" }, { "reusableObjectsLocation": "#/$defs" }',
    },
  },
  xor: {
    type: 'object',
    properties: {
      properties: {
        type: 'array',
        items: {
          type: 'string',
        },
        minItems: 2,
        maxItems: 2,
        errorMessage: `"xor" and its "properties" option support 2-item tuples, i.e. ["id", "name"]`,
        description: 'the properties to check',
      },
    },
    additionalProperties: false,
    required: ['properties'],
    errorMessage: {
      type: `"xor" function has invalid options specified. Example valid options: { "properties": ["id", "name"] }, { "properties": ["country", "street"] }`,
    },
  },
};
