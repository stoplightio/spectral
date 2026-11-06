import { default as AjvBase, ValidateFunction, SchemaObject } from 'ajv';
import type AjvCore from 'ajv/dist/core';
import type { Options as AjvOptions } from 'ajv/dist/core';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import AjvDraft4 from 'ajv-draft-04';
import addFormats from 'ajv-formats';
import ajvErrors from 'ajv-errors';
import * as draft6MetaSchema from 'ajv/dist/refs/json-schema-draft-06.json';
import * as draft4MetaSchema from './draft4.json';

import { Options } from './index';

/**
 * The limited set of Ajv options used in the schema validators.
 */
type ValidationOptions = Pick<AjvOptions, 'allErrors' | 'unicodeRegExp'>;

/**
 * A unique key for Ajv options.
 */
type AjvInstanceKey = string;

const logger = {
  warn(...args: unknown[]): void {
    const firstArg = args[0];
    if (typeof firstArg === 'string') {
      if (firstArg.startsWith('unknown format')) return;
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },
  // eslint-disable-next-line no-console
  log: console.log,
  // eslint-disable-next-line no-console
  error: console.error,
};

/**
 * Creates a new Ajv JSON schema validator instance with the given dialect constructor and validation options.
 * @param Ajv The Ajv constructor for a particular schema language.
 * @param validationOptions The validation options to override in the Ajv validator instance.
 * @returns
 */
function createAjvInstance(Ajv: typeof AjvCore, validationOptions: ValidationOptions): AjvCore {
  const defaultAllErrors = false;
  const ajv = new Ajv({
    allErrors: defaultAllErrors,
    meta: true,
    messages: true,
    strict: false,
    allowUnionTypes: true,
    logger,
    unicodeRegExp: false,
    ...validationOptions,
  });
  addFormats(ajv);
  if (validationOptions.allErrors ?? defaultAllErrors) {
    ajvErrors(ajv);
  }

  if (Ajv === AjvBase) {
    ajv.addSchema(draft4MetaSchema);
    ajv.addSchema(draft6MetaSchema);
  }

  return ajv;
}

const instanceKey = (validationOptions: ValidationOptions): AjvInstanceKey => {
  const parts = [
    validationOptions.allErrors ?? false ? 'allErrors' : 'default',
    validationOptions.unicodeRegExp ?? false ? 'unicodeRegExp' : 'noUnicodeRegExp',
  ];
  return parts.join('-');
};

/**
 * Creates a manager that lazily loads Ajv validator instances given runtime validation options.
 */
function _createAjvInstances(Ajv: typeof AjvCore): { getInstance: (validationOptions: ValidationOptions) => AjvCore } {
  const _instances = new Map<AjvInstanceKey, AjvCore>();

  return {
    getInstance(validationOptions: ValidationOptions): AjvCore {
      const key = instanceKey(validationOptions);
      const instance = _instances.get(key);
      if (instance !== void 0) {
        return instance;
      } else {
        const newInstance = createAjvInstance(Ajv, validationOptions);
        _instances.set(key, newInstance);
        return newInstance;
      }
    },
  };
}

type AssignAjvInstance = (
  schema: SchemaObject,
  dialect: string,
  validationOptions: ValidationOptions,
) => ValidateFunction;

export function createAjvInstances(): AssignAjvInstance {
  const ajvInstances: Partial<Record<NonNullable<Options['dialect']>, ReturnType<typeof _createAjvInstances>>> = {
    auto: _createAjvInstances(AjvBase),
    draft4: _createAjvInstances(AjvDraft4),
    'draft2019-09': _createAjvInstances(Ajv2019),
    'draft2020-12': _createAjvInstances(Ajv2020),
  };

  const compiledSchemas = new WeakMap<AjvCore, WeakMap<SchemaObject, ValidateFunction>>();

  return function (schema, dialect, validationOptions: ValidationOptions): ValidateFunction {
    const instances = (ajvInstances[dialect] ?? ajvInstances.auto) as ReturnType<typeof _createAjvInstances>;
    const ajv = instances.getInstance(validationOptions);

    const $id = schema.$id;

    if (typeof $id === 'string') {
      return ajv.getSchema($id) ?? ajv.compile(schema);
    } else {
      const actualCompiledSchemas =
        compiledSchemas.get(ajv) ?? compiledSchemas.set(ajv, new WeakMap<SchemaObject, ValidateFunction>()).get(ajv)!;

      return actualCompiledSchemas.get(schema) ?? actualCompiledSchemas.set(schema, ajv.compile(schema)).get(schema)!;
    }
  };
}
