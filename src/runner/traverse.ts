import { encodePointerFragment } from '@stoplight/json';
import { JsonPath } from '@stoplight/types';
import { IGivenNode } from '../types';
import { decodeSegmentFragment } from '../utils';
import { OptimizedRule } from './rule';

export type TraverseCallback = (rule: OptimizedRule, node: IGivenNode) => void;
export type TraverseCache = WeakMap<RegExp, boolean>;

function _traverse(curObj: object, rules: OptimizedRule[], path: JsonPath, cb: TraverseCallback) {
  for (const key of Object.keys(curObj)) {
    const value = curObj[key];
    const length = path.push(encodePointerFragment(key));
    const stringifiedPath = path.join('/');

    let node;

    const cache: TraverseCache = new WeakMap();

    for (const rule of rules) {
      if (rule.matchesPath(stringifiedPath, cache)) {
        if (node === void 0) {
          node = {
            path: path.map(decodeSegmentFragment),
            value,
          };
        }

        cb(rule, node);
      }
    }

    if (typeof value === 'object' && value !== null) {
      _traverse(value, rules, path, cb);
    }

    path.length = length - 1;
  }
}

export function traverse(obj: object, rules: OptimizedRule[], cb: TraverseCallback) {
  _traverse(obj, rules, [], cb);
}
