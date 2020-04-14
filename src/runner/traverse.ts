import { encodePointerFragment } from '@stoplight/json';
import { JsonPath } from '@stoplight/types';
import { IGivenNode } from '../types';
import { OptimizedRule } from './rule';

export type TraverseCallback = (rule: OptimizedRule, node: IGivenNode) => void;
export type TraverseCache = WeakMap<RegExp, boolean>;

const pathMap = new WeakMap<JsonPath, JsonPath>();

function _traverse(curObj: object, rules: OptimizedRule[], path: JsonPath, cb: TraverseCallback) {
  let nodePath = pathMap.get(path);
  if (nodePath === void 0) {
    nodePath = [];
    pathMap.set(path, nodePath);
  }

  const node = {
    path: nodePath,
    value: void 0,
  };

  for (const key of Object.keys(curObj)) {
    const value = curObj[key];
    const length = path.push(key.indexOf('/') !== -1 ? encodePointerFragment(key) : key);
    nodePath.push(key);
    const stringifiedPath = path.join('/');

    node.value = value;

    const cache: TraverseCache = new WeakMap();

    for (const rule of rules) {
      if (rule.matchesPath(stringifiedPath, cache)) {
        cb(rule, node);
      }
    }

    if (typeof value === 'object' && value !== null) {
      _traverse(value, rules, path, cb);
    }

    nodePath.length = length - 1;
    path.length = length - 1;
  }
}

export function traverse(obj: object, rules: OptimizedRule[], cb: TraverseCallback) {
  _traverse(obj, rules, [], cb);
}
