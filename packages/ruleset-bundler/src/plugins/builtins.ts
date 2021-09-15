import * as core from '@stoplight/spectral-core';
import * as formats from '@stoplight/spectral-formats';
import * as functions from '@stoplight/spectral-functions';
import * as parsers from '@stoplight/spectral-parsers';
import * as refResolver from '@stoplight/spectral-ref-resolver';
import * as rulesets from '@stoplight/spectral-rulesets';
import * as runtime from '@stoplight/spectral-runtime';
import type { Plugin } from 'rollup';

type Module = 'core' | 'formats' | 'functions' | 'parsers' | 'ref-resolver' | 'rulesets' | 'runtime';
type GlobalModules = Record<`@stoplight/spectral-${Module}`, string>;
type Overrides = Record<keyof GlobalModules, Record<string, unknown>>;

function registerModule(
  id: keyof GlobalModules,
  members: Record<string, unknown>,
  overrides: Partial<Overrides>,
): [string, string] {
  const actualOverrides = overrides[id];
  globalThis[Symbol.for(id)] = actualOverrides ? { ...members, ...actualOverrides } : members;

  const m = `globalThis[Symbol.for('${id}')]`;
  let code = '';
  for (const member of Object.keys(members)) {
    code += `export const ${member} = ${m}['${member}'];\n`;
  }

  return [id, code];
}

export const builtins = (overrides: Partial<Overrides> = {}): Plugin => {
  const modules = Object.fromEntries([
    registerModule('@stoplight/spectral-core', core, overrides),
    registerModule('@stoplight/spectral-formats', formats, overrides),
    registerModule('@stoplight/spectral-functions', functions, overrides),
    registerModule('@stoplight/spectral-parsers', parsers, overrides),
    registerModule('@stoplight/spectral-ref-resolver', refResolver, overrides),
    registerModule('@stoplight/spectral-rulesets', rulesets, overrides),
    registerModule('@stoplight/spectral-runtime', runtime, overrides),
  ]) as GlobalModules;

  return {
    name: '@stoplight-spectral/builtins',
    resolveId(id) {
      if (id in modules) {
        return id;
      }

      return null;
    },
    load(id) {
      if (id in modules) {
        return modules[id] as string;
      }

      return;
    },
  };
};
