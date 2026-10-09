import { default as AjvBase, ValidateFunction, SchemaObject, ErrorObject } from 'ajv';
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

// Deep-copies an ErrorObject so cached entries are isolated from caller mutations.
// params is always shallow-copied; for ajv-errors errors params.errors is recursively copied.
function deepCopyError(e: ErrorObject): ErrorObject {
  const params = e.params as Record<string, unknown>;
  if (Array.isArray(params?.errors)) {
    return {
      ...e,
      params: { ...params, errors: (params.errors as ErrorObject[]).map(deepCopyError) },
    } as ErrorObject;
  }
  return { ...e, params: { ...params } } as ErrorObject;
}

// Rebases instancePath in an error and its params.errors descendants by prepending prefix.
// ajv-errors stores absolute sub-validator paths; every level must shift on cache replay.
function rebaseError(e: ErrorObject, prefix: string): ErrorObject {
  const copy = deepCopyError(e);
  copy.instancePath = prefix + e.instancePath;
  const params = copy.params as Record<string, unknown>;
  if (Array.isArray(params?.errors)) {
    params.errors = (params.errors as ErrorObject[]).map(child => rebaseError(child, prefix));
  }
  return copy;
}

type CacheSlot = { cache: WeakMap<object, { valid: boolean; errors: ErrorObject[] | null }> };

type SubEnvRecord = Record<string, { validate?: unknown }>;

// Per-subEnv shared state: the single installed wrapper plus all root slots.
// Multiple roots referencing the same subEnv append to allSlots. Before each
// root call every slot in allSlots is replaced with a fresh WeakMap — this is
// the only way to prevent a stale hit from another root's prior invocation, since
// the shared wrapper checks allSlots in order and uses the first hit it finds.
interface SharedSubEnvState {
  allSlots: CacheSlot[];
  origFn: ValidateFunction;
}
const subEnvStates = new WeakMap<object, SharedSubEnvState>();

// Dialects that introduce cross-call sub-validator state (unevaluatedProperties,
// dynamicRef) are left on the original unoptimized path.
const UNSUPPORTED_DIALECTS = new Set(['draft2019-09', 'draft2020-12']);

// Attaches a per-run nested cache to a compiled root validator. For every
// schemaEnv.refs entry whose validate is a compiled sub-validator, a shared
// cachedValidate wrapper is installed once per subEnv. Every root appends a
// slot to allSlots. Before each root invocation ALL slots on every referenced
// subEnv are reset, preventing cross-root staleness regardless of call order.
function attachNestedCache(rootVf: ValidateFunction, dialect: string): ValidateFunction {
  if (UNSUPPORTED_DIALECTS.has(dialect)) return rootVf;
  const refs = (rootVf as unknown as { schemaEnv?: { refs?: SubEnvRecord } }).schemaEnv?.refs;
  if (!refs) return rootVf;

  // All shared-slot lists this root touches — needed for the full reset.
  const sharedStates: SharedSubEnvState[] = [];

  for (const key of Object.keys(refs)) {
    const subEnv = refs[key];
    const currentFn = subEnv.validate;
    if (typeof currentFn !== 'function') continue;

    let state = subEnvStates.get(subEnv);
    if (!state) {
      // First root to touch this subEnv: record origFn and install the shared wrapper.
      state = { allSlots: [], origFn: currentFn as ValidateFunction };
      subEnvStates.set(subEnv, state);
      const s = state;
      function sharedCachedValidate(this: unknown, data: unknown, opts: Record<string, unknown>): boolean {
        if (data === null || typeof data !== 'object' || Array.isArray(data)) {
          const ok = (s.origFn as (d: unknown, o: unknown) => boolean).call(this, data, opts);
          sharedCachedValidate.errors = s.origFn.errors;
          return ok;
        }
        const ip = typeof opts?.instancePath === 'string' ? opts.instancePath : '';
        for (const slot of s.allSlots) {
          const entry = slot.cache.get(data);
          if (entry !== undefined) {
            sharedCachedValidate.errors = entry.errors ? entry.errors.map(e => rebaseError(e, ip)) : null;
            return entry.valid;
          }
        }
        const valid = (s.origFn as (d: unknown, o: unknown) => boolean).call(this, data, {
          ...opts,
          instancePath: '',
        });
        const rawErrors = s.origFn.errors ? s.origFn.errors.map(deepCopyError) : null;
        if (s.allSlots.length > 0) {
          s.allSlots[0].cache.set(data, { valid, errors: rawErrors });
        }
        sharedCachedValidate.errors = rawErrors ? rawErrors.map(e => rebaseError(e, ip)) : null;
        return valid;
      }
      sharedCachedValidate.errors = null as ValidateFunction['errors'];
      subEnv.validate = sharedCachedValidate;
    }

    const slot: CacheSlot = { cache: new WeakMap() };
    state.allSlots.push(slot);
    sharedStates.push(state);
  }

  if (sharedStates.length === 0) return rootVf;

  const origRoot = rootVf;
  function wrappedRoot(this: unknown, data: unknown, opts?: unknown): boolean {
    // Reset ALL slots on every subEnv this root touches. A hit in any slot
    // (from any root's prior call) would serve stale data for this invocation.
    for (const state of sharedStates) {
      for (const slot of state.allSlots) slot.cache = new WeakMap();
    }
    const ok = (origRoot as (d: unknown, o?: unknown) => boolean).call(this, data, opts);
    wrappedRoot.errors = origRoot.errors;
    return ok;
  }
  wrappedRoot.errors = null as ValidateFunction['errors'];
  (wrappedRoot as unknown as Record<string, unknown>).schema = (origRoot as unknown as Record<string, unknown>).schema;
  (wrappedRoot as unknown as Record<string, unknown>).schemaEnv = (
    origRoot as unknown as Record<string, unknown>
  ).schemaEnv;
  return wrappedRoot as unknown as ValidateFunction;
}

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
        compiledSchemas.get(ajv) ?? compiledSchemas.set(ajv, new WeakMap<SchemaObject, ValidateFunction>()).get(ajv)!;

      return actualCompiledSchemas.get(schema) ?? actualCompiledSchemas.set(schema, ajv.compile(schema)).get(schema)!;
    }
  };
}

// Variant of createAjvInstances that wraps compiled validators with a per-run
// nested-object result cache. Use when the rule validates an entire resolved
// document (given:'$') and the schema contains recursive definitions — the common
// case for large OAS-style schemas where $ref resolution shares object identity.
//
// The wrapped root validator resets its cache on each call, so results never
// persist across independent spectral.run() invocations.
//
// Correctness boundary:
//   - $data references: not enabled in Spectral's AJV config — safe
//   - draft2019-09 / draft2020-12: returned unwrapped — unevaluated/dynamicRef
//     state is preserved by falling through to unoptimized validation
//   - async validation: not used — safe
//   - ajv-errors params.errors: deep-copied and rebased on miss and replay — safe
//
// Unsupported: schemas where sub-validator correctness depends on parentData or
// rootData context.
export function createAjvInstancesWithNestedCache(): AssignAjvInstance {
  const base = createAjvInstances();
  const wrapped = new WeakMap<ValidateFunction, ValidateFunction>();

  return function (schema, dialect, allErrors): ValidateFunction {
    const rootVf = base(schema, dialect, allErrors);
    return wrapped.get(rootVf) ?? wrapped.set(rootVf, attachNestedCache(rootVf, dialect)).get(rootVf)!;
  };
}
