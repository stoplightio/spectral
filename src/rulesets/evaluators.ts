import { Optional } from '@stoplight/types';

export type CJSExport = Partial<{ exports: object | ESCJSCompatibleExport }>;
export type ESCJSCompatibleExport = Partial<{ default: unknown }>;
export type ContextExport = Partial<{ returnExports: unknown }>;

const createDefine = (exports: CJSExport) => {
  const define = (modules: string[], factory: Function): Optional<CJSExport> => {
    if (typeof factory === 'function') {
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

const isObject = (thing: unknown): thing is object => thing !== null && typeof thing === 'object';

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

  // todo: make window a 'trap' + detect 'global' + support node global
  Function('module, exports, define, window', String(body)).call(root, mod, exports, define, {});

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
