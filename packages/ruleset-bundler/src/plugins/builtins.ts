import * as core from '@stoplight/spectral-core';
import * as formats from '@stoplight/spectral-formats';
import * as functions from '@stoplight/spectral-functions';
import * as parsers from '@stoplight/spectral-parsers';
import * as refResolver from '@stoplight/spectral-ref-resolver';
import * as rulesets from '@stoplight/spectral-rulesets';
import * as runtime from '@stoplight/spectral-runtime';
import type { Plugin, InputOptions } from 'rollup';

type Module = 'core' | 'formats' | 'functions' | 'parsers' | 'ref-resolver' | 'rulesets' | 'runtime';
type GlobalModules = Record<`@stoplight/spectral-${Module}`, string>;
type Overrides = Record<keyof GlobalModules, Record<string, unknown>>;

const NAME = '@stoplight-spectral/builtins';

function registerModule(
  instanceId: number,
  id: keyof GlobalModules,
  members: Record<string, unknown>,
  overrides: Partial<Overrides>,
): [string, string] {
  const actualOverrides = overrides[id];
  const instances = (globalThis[Symbol.for(NAME)] ??= {}) as Record<string, Partial<Overrides>>;
  const root = (instances[instanceId] ??= {});

  root[id] = actualOverrides ? { ...members, ...actualOverrides } : members;

  const m = `globalThis[Symbol.for('${NAME}')]['${instanceId}']['${id}']`;
  let code = '';
  for (const member of Object.keys(members)) {
    code += `export const ${member} = ${m}['${member}'];\n`;
  }

  return [id, code];
}

export const builtins = (overrides: Partial<Overrides> = {}): Plugin => {
  const instanceId = Math.round(Math.random() * 1_000_000);

  const modules = Object.fromEntries([
    registerModule(instanceId, '@stoplight/spectral-core', core, overrides),
    registerModule(instanceId, '@stoplight/spectral-formats', formats, overrides),
    registerModule(instanceId, '@stoplight/spectral-functions', functions, overrides),
    registerModule(instanceId, '@stoplight/spectral-parsers', parsers, overrides),
    registerModule(instanceId, '@stoplight/spectral-ref-resolver', refResolver, overrides),
    registerModule(instanceId, '@stoplight/spectral-rulesets', rulesets, overrides),
    registerModule(instanceId, '@stoplight/spectral-runtime', runtime, overrides),
  ]) as GlobalModules;

  return {
    name: NAME,
    options(rawOptions): InputOptions {
      const external = rawOptions.external;

      if (typeof external === 'function') {
        return {
          ...rawOptions,
          external: <typeof external>(
            ((id, importer, isResolved) => !(id in modules) && external(id, importer, isResolved))
          ),
        };
      }

      return rawOptions;
    },
    resolveId(id): string | null {
      if (id in modules) {
        return id;
      }

      return null;
    },
    load(id): string | undefined {
      if (id in modules) {
        return modules[id] as string;
      }

      return;
    },
  };
};
