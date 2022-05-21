import { default as AjvBase, ValidateFunction, SchemaObject } from 'ajv';
import type AjvCore from 'ajv/dist/core';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import AjvDraft4 from 'ajv-draft-04';
import addFormats from 'ajv-formats';
import ajvErrors from 'ajv-errors';
import * as draft6MetaSchema from 'ajv/dist/refs/json-schema-draft-06.json';
import * as draft4MetaSchema from './draft4.json';

import { Options } from './index';

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

function createAjvInstance(Ajv: typeof AjvCore, allErrors: boolean): AjvCore {
  const ajv = new Ajv({
    allErrors,
    meta: true,
    messages: true,
    strict: false,
    allowUnionTypes: true,
    logger,
    unicodeRegExp: false,
  });
  addFormats(ajv);
  if (allErrors) {
    ajvErrors(ajv);
  }

  if (Ajv === AjvBase) {
    ajv.addSchema(draft4MetaSchema);
    ajv.addSchema(draft6MetaSchema);
  }

  return ajv;
}

function _createAjvInstances(Ajv: typeof AjvCore): { default: AjvCore; allErrors: AjvCore } {
  let _default: AjvCore;
  let _allErrors: AjvCore;

  return {
    get default(): AjvCore {
      _default ??= createAjvInstance(Ajv, false);
      return _default;
    },
    get allErrors(): AjvCore {
      _allErrors ??= createAjvInstance(Ajv, true);
      return _allErrors;
    },
  };
}

type AssignAjvInstance = (schema: SchemaObject, dialect: string, allErrors: boolean) => ValidateFunction;

export function createAjvInstances(): AssignAjvInstance {
  const ajvInstances: Partial<Record<NonNullable<Options['dialect']>, ReturnType<typeof _createAjvInstances>>> = {
    auto: _createAjvInstances(AjvBase),
    draft4: _createAjvInstances(AjvDraft4),
    'draft2019-09': _createAjvInstances(Ajv2019),
    'draft2020-12': _createAjvInstances(Ajv2020),
  };

  const compiledSchemas = new WeakMap<AjvCore, WeakMap<SchemaObject, ValidateFunction>>();

  return function (schema, dialect, allErrors): ValidateFunction {
    const instances = (ajvInstances[dialect] ?? ajvInstances.auto) as ReturnType<typeof _createAjvInstances>;
    const ajv = instances[allErrors ? 'allErrors' : 'default'];

    const $id = schema.$id;

    if (typeof $id === 'string') {
      return ajv.getSchema($id) ?? ajv.compile(schema);
    } else {
      const actualCompiledSchemas =
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        compiledSchemas.get(ajv) ?? compiledSchemas.set(ajv, new WeakMap<SchemaObject, ValidateFunction>()).get(ajv)!;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return actualCompiledSchemas.get(schema) ?? actualCompiledSchemas.set(schema, ajv.compile(schema)).get(schema)!;
    }
  };
}
