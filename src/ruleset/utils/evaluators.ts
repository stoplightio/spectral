/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-assignment */
import { join, stripRoot } from '@stoplight/path';
import { Dictionary, Optional } from '@stoplight/types';
import { isObject } from 'lodash';
import { IFunction } from '../../types';

export type CJSExport = Partial<{
  exports: Record<string, unknown> | ESCJSCompatibleExport;
  require: NodeJS.Require;
}>;
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
  function req(p: string): unknown {
    if (p.startsWith('.')) {
      p = join(source, '..', stripRoot(p));
    } else if (p === '@stoplight/spectral-core') {
      p = require.resolve('../../index');
    } else if (p === '@stoplight/spectral-functions') {
      p = require.resolve('../../functions/index');
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      p = eval('require.resolve')(p, { paths: [join(source, '..')] });
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
export const evaluateExport = (body: string, source: string | null, inject: Dictionary<unknown> = {}): Function => {
  const req = createRequire(source);
  const mod: CJSExport = {
    exports: {},
    require: req,
  };
  const exports: ESCJSCompatibleExport | unknown = {};
  const root: ContextExport = {};
  const define = createDefine(mod);

  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  Function('module', 'exports', 'define', 'require', ...Object.keys(inject), String(body)).call(
    root,
    mod,
    exports,
    define,
    req,
    ...Object.values(inject),
  );

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

export type CompileOptions = {
  code: string;
  name: string;
  source: string | null;
  inject: Dictionary<unknown>;
};

export const compileExportedFunction = ({ code, name, source, inject }: CompileOptions) => {
  const fn = evaluateExport(code, source, inject) as IFunction;

  Reflect.defineProperty(fn, 'name', {
    configurable: true,
    value: name,
  });

  Object.freeze(fn);
  return fn;
};
