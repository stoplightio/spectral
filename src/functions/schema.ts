import { decodePointerFragment } from '@stoplight/json';
import { Optional } from '@stoplight/types';
import * as AJV from 'ajv';
import { ValidateFunction } from 'ajv';
import * as jsonSpecV4 from 'ajv/lib/refs/json-schema-draft-04.json';
import * as jsonSpecV6 from 'ajv/lib/refs/json-schema-draft-06.json';
import * as jsonSpecV7 from 'ajv/lib/refs/json-schema-draft-07.json';
import { IOutputError } from 'better-ajv-errors';
import { capitalize, escapeRegExp } from 'lodash';
import { IFunction, IFunctionResult, JSONSchema } from '../types';
const oasFormatValidator = require('ajv-oai/lib/format-validator');
const betterAjvErrors = require('better-ajv-errors/lib/modern');

export interface ISchemaFunction extends IFunction<ISchemaOptions> {
  Ajv: typeof AJV;
  specs: {
    v4: typeof jsonSpecV4;
    v6: typeof jsonSpecV6;
    v7: typeof jsonSpecV7;
  };
  createAJVInstance(opts: AJV.Options): AJV.Ajv;
}

export interface ISchemaOptions {
  schema: object;
  // The oasVersion, either 2 or 3 for OpenAPI Spec versions, could also be 3.1 or a larger number if there's a need for it, otherwise JSON Schema
  oasVersion?: Optional<2 | 3 | 3.1>;
  allErrors?: boolean;
  ajv?: ValidateFunction;

  // this is used by oasDocumentSchema function, to be removed once we sort out
  prepareResults?(errors: AJV.ErrorObject[]): void;
}

interface IAJVOutputError extends IOutputError {
  path?: string;
}

const logger = {
  warn(...args: any[]) {
    const firstArg = args[0];
    if (typeof firstArg === 'string') {
      if (firstArg.startsWith('unknown format')) return;
      console.warn(...args);
    }
  },
  log: console.log,
  error: console.error,
};

const ajvInstances = {};

function getAjv(oasVersion: Optional<number>, allErrors: Optional<boolean>): AJV.Ajv {
  const type: string = oasVersion && oasVersion >= 2 ? 'oas' + oasVersion : 'jsonschema';
  if (typeof ajvInstances[type] !== 'undefined') {
    return ajvInstances[type];
  }

  const ajvOpts: AJV.Options = {
    meta: true, // Add default meta schemas (draft 7 at the moment)
    schemaId: 'auto',
    allErrors,
    jsonPointers: true,
    unknownFormats: 'ignore',
    nullable: oasVersion === 3, // Support nullable for OAS3
    logger,
  };

  const ajv = schema.createAJVInstance(ajvOpts);
  // We need v4 for OpenAPI and it doesn't hurt to have v6 as well.
  ajv.addMetaSchema(jsonSpecV4);
  ajv.addMetaSchema(jsonSpecV6);

  // @ts-ignore
  ajv._opts.defaultMeta = jsonSpecV4.id;
  // @ts-ignore
  ajv._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/schema';

  ajvInstances[type] = ajv;
  return ajv;
}

function getSchemaId(schemaObj: JSONSchema): void | string {
  if ('$id' in schemaObj) {
    return schemaObj.$id;
  }

  if ('id' in schemaObj) {
    return schemaObj.id;
  }
}

const validators = new (class extends WeakMap<JSONSchema, ValidateFunction> {
  public get({ schema: schemaObj, oasVersion, allErrors }: ISchemaOptions) {
    const ajv = getAjv(oasVersion, allErrors);
    const schemaId = getSchemaId(schemaObj);
    let validator = schemaId !== void 0 ? ajv.getSchema(schemaId) : void 0;
    if (validator !== void 0) {
      return validator;
    }

    validator = super.get(schemaObj);
    if (validator === void 0) {
      // compiling might give us some perf improvements
      validator = ajv.compile(schemaObj);
      super.set(schemaObj, validator);
    }

    return validator;
  }
})();

const replaceProperty = (
  substring: string,
  potentialProperty: Optional<number | string>,
  propertyName: Optional<string>,
) => {
  if (typeof potentialProperty === 'string' && propertyName !== void 0) {
    return `Property \`${propertyName}\``;
  }

  return '{{property|gravis|append-property|optional-typeof|capitalize}}';
};

const cleanAJVErrorMessage = (message: string, path: Optional<string>, suggestion: Optional<string>, type: string) => {
  let cleanMessage = message.trim();

  if (path) {
    cleanMessage = message.replace(
      new RegExp(`^${escapeRegExp(decodePointerFragment(path))}:?\\s*(?:(Property\\s+)([^\\s]+))?`),
      replaceProperty,
    );
  } else if (cleanMessage.startsWith(':')) {
    cleanMessage = cleanMessage.replace(/:\s*/, replaceProperty);
  } else if (cleanMessage.startsWith('Property ')) {
    cleanMessage = cleanMessage.replace(/(Property\s+)([^\s]+)/, replaceProperty);
  } else {
    cleanMessage = `${capitalize(type)} ${cleanMessage}`;
  }

  return `${cleanMessage.replace(/['"]/g, '`')}${
    typeof suggestion === 'string' && suggestion.length > 0 ? `. ${suggestion}` : ''
  }`;
};

export const schema: ISchemaFunction = (targetVal, opts, paths, { rule }) => {
  const path = paths.target || paths.given;

  if (targetVal === void 0) {
    return [
      {
        path,
        message: `{{property|gravis|append-property}}does not exist`,
      },
    ];
  }

  const results: IFunctionResult[] = [];

  // we already access a resolved object in src/functions/schema-path.ts
  const { schema: schemaObj } = opts;

  try {
    // we used the compiled validation now, hence this lookup here (see the logic above for more info)
    const validator = opts.ajv ?? validators.get(opts);
    if (!validator(targetVal) && validator.errors) {
      opts.prepareResults?.(validator.errors);

      try {
        results.push(
          ...(betterAjvErrors(schemaObj, targetVal, validator.errors, { format: 'js' }) as IAJVOutputError[]).map(
            ({ suggestion, error, path: errorPath }) => ({
              message: cleanAJVErrorMessage(error, errorPath, suggestion, typeof targetVal),
              path: [...path, ...(errorPath ? errorPath.replace(/^\//, '').split('/') : [])],
            }),
          ),
        );
      } catch {
        results.push(
          ...validator.errors.map(({ message, dataPath }) => ({
            message: message ? cleanAJVErrorMessage(message, dataPath, void 0, typeof targetVal) : '',
            path: [...path, ...dataPath.split('/').slice(1).map(decodePointerFragment)],
          })),
        );
      }
    }
  } catch (ex) {
    if (!(ex instanceof AJV.MissingRefError)) {
      throw ex;
    } else if (!rule.resolved) {
      // let's ignore any $ref errors if schema fn is provided with already resolved content,
      // if our resolver fails to resolve them,
      // ajv is unlikely to do it either, since it won't have access to the whole document, but a small portion of it
      results.push({
        message: ex.message,
        path,
      });
    }
  }

  return results;
};

schema.Ajv = AJV;
schema.createAJVInstance = (opts: AJV.Options) => {
  const ajv = new AJV(opts);

  ajv.addFormat('int32', { type: 'number', validate: oasFormatValidator.int32 });
  ajv.addFormat('int64', { type: 'number', validate: oasFormatValidator.int64 });
  ajv.addFormat('float', { type: 'number', validate: oasFormatValidator.float });
  ajv.addFormat('double', { type: 'number', validate: oasFormatValidator.double });
  ajv.addFormat('byte', { type: 'string', validate: oasFormatValidator.byte });

  return ajv;
};

schema.specs = {
  v4: jsonSpecV4,
  v6: jsonSpecV6,
  v7: jsonSpecV7,
};
