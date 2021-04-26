import Ajv from 'ajv';
import type AjvCore from 'ajv/dist/core';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

import * as draft4 from './draft4.json';

const logger = {
  warn(...args: unknown[]): void {
    const firstArg = args[0];
    if (typeof firstArg === 'string') {
      if (firstArg.startsWith('unknown format')) return;
      console.warn(...args);
    }
  },
  log: console.log,
  error: console.error,
};

export function createAjvInstance(Ajv: typeof AjvCore): AjvCore {
  const ajv = new Ajv({ allErrors: true, messages: true, strict: false, allowUnionTypes: true, logger });
  addFormats(ajv);
  return ajv;
}

const ajvInstances = {
  default: createAjvInstance(Ajv),
  draft2019_09: createAjvInstance(Ajv2019),
  draft2020_12: createAjvInstance(Ajv2020),
};

ajvInstances.default.addSchema(draft4);

export function assignAjvInstance(dialect: string): AjvCore {
  const draft: keyof typeof ajvInstances =
    dialect === 'draft2020-12' ? 'draft2020_12' : dialect === 'draft2019-10' ? 'draft2019_09' : 'default';

  return ajvInstances[draft];
}
