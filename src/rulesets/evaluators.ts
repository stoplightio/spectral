import { Optional } from '@stoplight/types';
import { isObject } from 'lodash';
import { IFunction, JSONSchema } from '../types';
import { decorateIFunctionWithSchemaValidation } from './validation';

export type CJSExport = Partial<{ exports: object | ESCJSCompatibleExport }>;
export type ESCJSCompatibleExport = Partial<{ default: unknown }>;
export type ContextExport = Partial<{ returnExports: unknown }>;

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
export const evaluateExport = (body: string): Function => {
  const mod: CJSExport = {
    exports: {},
  };
  const exports: ESCJSCompatibleExport | unknown = {};
  const root: ContextExport = {};
  const define = createDefine(mod);

  Function('module, exports, define', String(body)).call(root, mod, exports, define);

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

export const compileExportedFunction = (code: string, name: string, schema: JSONSchema | null) => {
  const exportedFn = evaluateExport(code) as IFunction;

  const fn = schema !== null ? decorateIFunctionWithSchemaValidation(exportedFn, schema) : exportedFn;

  Reflect.defineProperty(fn, 'name', {
    configurable: true,
    value: name,
  });

  return fn;
};
