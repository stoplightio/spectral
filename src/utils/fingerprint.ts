import { IRuleResult } from '../types';

export type ComputeFingerprintFunc = (rule: IRuleResult, hash: (val: string) => string) => string;

export const defaultComputeResultFingerprint: ComputeFingerprintFunc = (rule, hash) => {
  let id = String(rule.code);

  if (rule.path && rule.path.length) {
    id += JSON.stringify(rule.path);
  } else if (rule.range) {
    id += JSON.stringify(rule.range);
  }

  if (rule.source) id += rule.source;

  return hash(id);
};
