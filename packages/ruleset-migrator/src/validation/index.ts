import { Ruleset } from './types';

import Ajv from 'ajv';
import schema from './schema';

const ajv = new Ajv({
  strict: true,
  strictTuples: false,
});

ajv.addSchema(schema);

export function assertRuleset(maybeRuleset: unknown): asserts maybeRuleset is Ruleset {
  if (!ajv.validate(schema, maybeRuleset)) {
    throw new Error('Invalid ruleset provided');
  }
}

export function assertString(maybeString: unknown): asserts maybeString is string {
  if (typeof maybeString !== 'string') {
    throw new TypeError(`${String(maybeString)} is not a string`);
  }
}

export function assertArray(maybeArray: unknown): asserts maybeArray is unknown[] {
  if (!Array.isArray(maybeArray)) {
    throw new TypeError(`${String(maybeArray)} is not an array`);
  }
}
