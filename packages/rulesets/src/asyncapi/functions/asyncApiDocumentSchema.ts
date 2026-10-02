/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { createRulesetFunction, IFunctionResult, Format } from '@stoplight/spectral-core';
import { schema as schemaFn } from '@stoplight/spectral-functions';
import type { ErrorObject } from 'ajv';
import { getCopyOfSchema, selectAsyncAPISchema } from './utils/specs';
import type { AsyncAPISpecVersion } from './utils/specs';

type RawSchema = Record<string, unknown>;
const aas3VersionPattern = '^3\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)$';

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
function prepareV3ResolvedSchema(copied: any, version: AsyncAPISpecVersion): any {
  const definition = (name: string): string => `http://asyncapi.com/definitions/${version}/${name}.json`;

  // channel object
  const channelObject = copied.definitions[definition('channel')];
  channelObject.properties.servers.items.$ref = definition('server');

  // operation object
  const operationSchema = copied.definitions[definition('operation')];
  operationSchema.properties.channel.$ref = definition('channel');
  operationSchema.properties.messages.items.$ref = definition('messageObject');

  // operation reply object
  const operationReplySchema = copied.definitions[definition('operationReply')];
  operationReplySchema.properties.channel.$ref = definition('channel');
  operationReplySchema.properties.messages.items.$ref = definition('messageObject');

  return copied;
}

const serializedSchemas = new Map<string, RawSchema>();
function getSerializedSchema(version: AsyncAPISpecVersion, resolved: boolean, fallback: boolean): RawSchema {
  const serializedSchemaKey = `${version}-${resolved ? 'resolved' : 'unresolved'}${fallback ? '-fallback' : ''}`;
  const schema = serializedSchemas.get(serializedSchemaKey);
  if (schema) {
    return schema;
  }

  // Copy to not operate on the original json schema - between imports (in different modules) we operate on this same schema.
  let copied = getCopyOfSchema(version) as {
    $id: string;
    definitions: RawSchema;
    properties: { asyncapi: RawSchema };
  };
  // Remove the meta schemas because they are already present within Ajv, and it's not possible to add duplicated schemas.
  delete copied.definitions['http://json-schema.org/draft-07/schema'];
  delete copied.definitions['http://json-schema.org/draft-04/schema'];
  // Spectral caches the schemas using '$id' property
  copied['$id'] = copied['$id'].replace(
    'asyncapi.json',
    `asyncapi-${resolved ? 'resolved' : 'unresolved'}${fallback ? '-fallback' : ''}.json`,
  );

  if (fallback) {
    delete copied.properties.asyncapi.const;
    copied.properties.asyncapi.pattern = aas3VersionPattern;
  }

  if (resolved && version.startsWith('3.')) {
    copied = prepareV3ResolvedSchema(copied, version);
  }

  serializedSchemas.set(serializedSchemaKey, copied);
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
  const selection = selectAsyncAPISchema(formats);
  if (selection === void 0) {
    return;
  }

  return getSerializedSchema(selection.version, resolved, selection.fallback);
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
