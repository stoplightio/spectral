const md5 = require('blueimp-md5');

import { uniqBy } from 'lodash';

import { IRuleResult } from '../types';
import { compareResults } from './sortResults';

export type ComputeFingerprintFunc = (rule: IRuleResult, hash: (val: string) => string) => string;

export const defaultComputeResultFingerprint: ComputeFingerprintFunc = (rule, hash) => {
  let id = String(rule.code);

  if (rule.path.length) {
    id += JSON.stringify(rule.path);
  } else if (rule.range) {
    id += JSON.stringify(rule.range);
  }

  if (rule.source) id += rule.source;

  return hash(id);
};

export const prepareResults = (results: IRuleResult[], computeFingerprint: ComputeFingerprintFunc) => {
  decorateResultsWithFingerprint(results, computeFingerprint);

  return sortResults(deduplicateResults(results));
};

const decorateResultsWithFingerprint = (results: IRuleResult[], computeFingerprint: ComputeFingerprintFunc) => {
  for (const r of results) {
    Object.defineProperty(r, 'fingerprint', {
      value: computeFingerprint(r, md5),
    });
  }

  return results;
};

const deduplicateResults = (results: IRuleResult[]): IRuleResult[] => {
  return uniqBy([...results], 'fingerprint');
};

const sortResults = (results: IRuleResult[]): IRuleResult[] => {
  return [...results].sort(compareResults);
};
