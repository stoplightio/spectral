import type { createRulesetFunction } from '@stoplight/spectral-core';
import { CasingType } from './types';

type CustomFunctionOptionsSchema = Parameters<typeof createRulesetFunction>[0]['input'];

export const optionSchemas: Record<string, CustomFunctionOptionsSchema> = {
  alphabetical: {
    type: ['object', 'null'],
    properties: {
      keyedBy: {
        type: 'string',
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
      },
      disallowDigits: {
        type: 'boolean',
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
          },
          allowLeading: {
            type: 'boolean',
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
      },
      max: {
        type: 'number',
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
      },
      dialect: {
        enum: ['auto', 'draft4', 'draft6', 'draft7', 'draft2019-09', 'draft2020-12'],
        default: 'auto',
      },
      allErrors: {
        type: 'boolean',
        default: false,
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
      },
    },
    additionalProperties: false,
    required: ['properties'],
    errorMessage: {
      type: `"xor" function has invalid options specified. Example valid options: { "properties": ["id", "name"] }, { "properties": ["country", "street"] }`,
    },
  },
};
