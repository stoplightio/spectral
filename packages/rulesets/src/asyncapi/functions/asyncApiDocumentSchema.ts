/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import specs from '@asyncapi/specs';
import { createRulesetFunction, IFunctionResult, Format } from '@stoplight/spectral-core';
import { schema as schemaFn } from '@stoplight/spectral-functions';
import type { ErrorObject } from 'ajv';
import { getCopyOfSchema } from './utils/specs';
import { aas2_0, aas2_1, aas2_2, aas2_3, aas2_4, aas2_5, aas2_6, aas3_0 } from '@stoplight/spectral-formats';

type AsyncAPIVersions = keyof typeof specs.schemas;
type RawSchema = Record<string, unknown>;

function shouldIgnoreError(error: ErrorObject): boolean {
  return (
    // oneOf is a fairly error as we have 2 options to choose from for most of the time.
    error.keyword === 'oneOf' ||
    // the required $ref is entirely useless, since aas-schema rules operate on resolved content, so there won't be any $refs in the document
    (error.keyword === 'required' && error.params.missingProperty === '$ref')
  );
}

// ajv throws a lot of errors that have no understandable context, e.g. errors related to the fact that a value doesn't meet the conditions of some sub-schema in `oneOf`, `anyOf` etc.
// for this reason, we filter these unnecessary errors and leave only the most important ones (usually the first occurring in the list of errors).
export function prepareResults(errors: ErrorObject[]): void {
  // Update additionalProperties errors to make them more precise and prevent them from being treated as duplicates
  for (let i = 0; i < errors.length; i++) {
    const error = errors[i];

    if (error.keyword === 'additionalProperties') {
      error.instancePath = `${error.instancePath}/${String(error.params['additionalProperty'])}`;
    } else if (error.keyword === 'required' && error.params.missingProperty === '$ref') {
      errors.splice(i, 1);
      i--;
    }
  }

  for (let i = 0; i < errors.length; i++) {
    const error = errors[i];

    if (i + 1 < errors.length && errors[i + 1].instancePath === error.instancePath) {
      errors.splice(i + 1, 1);
      i--;
    } else if (i > 0 && shouldIgnoreError(error) && errors[i - 1].instancePath.startsWith(error.instancePath)) {
      errors.splice(i, 1);
      i--;
    }
  }
}

// this is needed because some v3 object fields are expected to be only `$ref` to other objects.
// In order to validate resolved references, we modify those schemas and instead allow the definition of the object
function prepareV3ResolvedSchema(copied: any): any {
  // channel object
  const channelObject = copied.definitions['http://asyncapi.com/definitions/3.0.0/channel.json'];
  channelObject.properties.servers.items.$ref = 'http://asyncapi.com/definitions/3.0.0/server.json';

  // operation object
  const operationSchema = copied.definitions['http://asyncapi.com/definitions/3.0.0/operation.json'];
  operationSchema.properties.channel.$ref = 'http://asyncapi.com/definitions/3.0.0/channel.json';
  operationSchema.properties.messages.items.$ref = 'http://asyncapi.com/definitions/3.0.0/messageObject.json';

  // operation reply object
  const operationReplySchema = copied.definitions['http://asyncapi.com/definitions/3.0.0/operationReply.json'];
  operationReplySchema.properties.channel.$ref = 'http://asyncapi.com/definitions/3.0.0/channel.json';
  operationReplySchema.properties.messages.items.$ref = 'http://asyncapi.com/definitions/3.0.0/messageObject.json';

  return copied;
}

const serializedSchemas = new Map<AsyncAPIVersions, RawSchema>();
function getSerializedSchema(version: AsyncAPIVersions, resolved: boolean): RawSchema {
  const serializedSchemaKey = resolved ? `${version}-resolved` : `${version}-unresolved`;
  const schema = serializedSchemas.get(serializedSchemaKey as AsyncAPIVersions);
  if (schema) {
    return schema;
  }

  // Copy to not operate on the original json schema - between imports (in different modules) we operate on this same schema.
  let copied = getCopyOfSchema(version) as { $id: string; definitions: RawSchema };
  // Remove the meta schemas because they are already present within Ajv, and it's not possible to add duplicated schemas.
  delete copied.definitions['http://json-schema.org/draft-07/schema'];
  delete copied.definitions['http://json-schema.org/draft-04/schema'];
  // Spectral caches the schemas using '$id' property
  copied['$id'] = copied['$id'].replace('asyncapi.json', `asyncapi-${resolved ? 'resolved' : 'unresolved'}.json`);

  if (resolved && version === '3.0.0') {
    copied = prepareV3ResolvedSchema(copied);
  }

  serializedSchemas.set(serializedSchemaKey as AsyncAPIVersions, copied);
  return copied;
}

const refErrorMessage = 'Property "$ref" is not expected to be here';
function filterRefErrors(errors: IFunctionResult[], resolved: boolean) {
  if (resolved) {
    return errors.filter(err => err.message !== refErrorMessage);
  }

  return errors
    .filter(err => err.message === refErrorMessage)
    .map(err => {
      err.message = 'Referencing in this place is not allowed';
      return err;
    });
}

export function getSchema(formats: Set<Format>, resolved: boolean): Record<string, any> | void {
  switch (true) {
    case formats.has(aas3_0):
      return getSerializedSchema('3.0.0', resolved);
    case formats.has(aas2_6):
      return getSerializedSchema('2.6.0', resolved);
    case formats.has(aas2_5):
      return getSerializedSchema('2.5.0', resolved);
    case formats.has(aas2_4):
      return getSerializedSchema('2.4.0', resolved);
    case formats.has(aas2_3):
      return getSerializedSchema('2.3.0', resolved);
    case formats.has(aas2_2):
      return getSerializedSchema('2.2.0', resolved);
    case formats.has(aas2_1):
      return getSerializedSchema('2.1.0', resolved);
    case formats.has(aas2_0):
      return getSerializedSchema('2.0.0', resolved);
    default:
      return;
  }
}

export const asyncApiDocumentSchema = createRulesetFunction<unknown, { resolved: boolean }>(
  {
    input: null,
    options: {
      type: 'object',
      properties: {
        resolved: {
          type: 'boolean',
        },
      },
      required: ['resolved'],
    },
  },
  (targetVal, options, context) => {
    const formats = context.document?.formats;
    if (!formats) {
      return;
    }

    const resolved = options.resolved;
    const schema = getSchema(formats, resolved);
    if (!schema) {
      return;
    }

    const errors = schemaFn(
      targetVal,
      { allErrors: true, schema, prepareResults: resolved ? prepareResults : undefined },
      context,
    );
    if (!Array.isArray(errors)) {
      return;
    }

    return filterRefErrors(errors, resolved);
  },
);
