import { join, stripRoot } from '@stoplight/path';
import { Dictionary, Optional } from '@stoplight/types';
import { isObject } from 'lodash';
import { IFunction, JSONSchema } from '../types';
import { decorateIFunctionWithSchemaValidation } from './validation';

export type CJSExport = Partial<{ exports: object | ESCJSCompatibleExport; require: NodeJS.Require }>;
export type ESCJSCompatibleExport = Partial<{ default: unknown }>;
export type ContextExport = Partial<{ returnExports: unknown }>;

function requireUnavailable() {
  throw new ReferenceError('require() is supported only in the Node.JS environment');
}

function stubRequire(): NodeJS.Require {
  function req() {
    requireUnavailable();
  }

  const descriptors: Dictionary<PropertyDescriptor, keyof NodeJS.Require> = {
    resolve: {
      enumerable: true,
      get: requireUnavailable,
    },

    main: {
      enumerable: true,
      get: requireUnavailable,
    },

    cache: {
      enumerable: true,
      get: requireUnavailable,
    },

    extensions: {
      enumerable: true,
      get: requireUnavailable,
    },
  };

  return Object.defineProperties(req, descriptors);
}

function proxyRequire(source: string): NodeJS.Require {
  const actualRequire = require;
  function req(p: string) {
    if (p.startsWith('.')) {
      p = join(source, '..', stripRoot(p));
    } else {
      p = require.resolve(p, { paths: [join(source, '..')] });
    }

    return actualRequire.call(null, p);
  }

  return Object.defineProperties(req, Object.getOwnPropertyDescriptors(actualRequire));
}

const isRequiredSupported =
  typeof require === 'function' &&
  typeof require.main === 'object' &&
  require.main !== null &&
  'paths' in require.main &&
  'cache' in require;

const createRequire = (source: string | null): NodeJS.Require => {
  if (!isRequiredSupported) {
    return stubRequire();
  }

  if (source === null) {
    return require;
  }

  return proxyRequire(source);
};

const createDefine = (exports: CJSExport) => {
  const define = (nameOrFactory: string | string[] | Function, factory: Function): Optional<CJSExport> => {
    if (typeof nameOrFactory === 'function') {
      exports.exports = nameOrFactory();
    } else if (typeof factory === 'function') {
      exports.exports = factory();
    }

    return;
  };

  Reflect.defineProperty(define, 'amd', {
    value: true,
    configurable: false,
    writable: false,
    enumerable: true,
  });

  return define;
};

const isESCJSCompatibleExport = (obj: unknown): obj is ESCJSCompatibleExport => isObject(obj) && 'default' in obj;

// note: this code is hand-crafted and cover cases we want to support
// be aware of using it in your own project if you need to support a variety of module systems
export const evaluateExport = (body: string, source: string | null): Function => {
  const req = createRequire(source);
  const mod: CJSExport = {
    exports: {},
    require: req,
  };
  const exports: ESCJSCompatibleExport | unknown = {};
  const root: ContextExport = {};
  const define = createDefine(mod);

  Function('module, exports, define, require', String(body)).call(root, mod, exports, define, req);

  let maybeFn: unknown;

  if (isESCJSCompatibleExport(exports)) {
    maybeFn = exports.default;
  } else if ('returnExports' in root) {
    maybeFn = root.returnExports;
  } else if (isESCJSCompatibleExport(mod.exports)) {
    maybeFn = mod.exports.default;
  } else {
    maybeFn = mod.exports;
  }

  if (typeof maybeFn !== 'function') {
    throw new Error('Default function export expected');
  }

  return maybeFn;
};

export const compileExportedFunction = (
  code: string,
  name: string,
  source: string | null,
  schema: JSONSchema | null,
) => {
  const exportedFn = evaluateExport(code, source) as IFunction;

  const fn = schema !== null ? decorateIFunctionWithSchemaValidation(exportedFn, schema) : exportedFn;

  Reflect.defineProperty(fn, 'name', {
    configurable: true,
    value: name,
  });

  return fn;
};
