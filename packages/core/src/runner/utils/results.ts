import type { IPosition } from '@stoplight/types';
import type { ISpectralDiagnostic } from '../../types';

const computeResultFingerprint = (rule: ISpectralDiagnostic): string => {
  let id = String(rule.code);

  if (rule.path.length > 0) {
    id += JSON.stringify(rule.path);
  } else {
    id += JSON.stringify(rule.range);
  }

  if (rule.source !== void 0) {
    id += rule.source;
  }

  if (rule.message !== void 0) {
    id += rule.message;
  }

  return id;
};

export const prepareResults = (results: ISpectralDiagnostic[]): ISpectralDiagnostic[] => {
  return sortResults(deduplicateResults(results));
};

const deduplicateResults = (results: ISpectralDiagnostic[]): ISpectralDiagnostic[] => {
  const fingerprints = new Set<string>();

  return results.filter(result => {
    const fingerprint = computeResultFingerprint(result);
    if (fingerprints.has(fingerprint)) {
      return false;
    }

    fingerprints.add(fingerprint);
    return true;
  });
};

const compareCode = (left: string | number | undefined, right: string | number | undefined): number => {
  if (left === void 0 && right === void 0) {
    return 0;
  }

  if (left === void 0) {
    return -1;
  }

  if (right === void 0) {
    return 1;
  }

  return String(left).localeCompare(String(right), void 0, { numeric: true });
};

const compareSource = (left: string | undefined, right: string | undefined): number => {
  if (left === void 0 && right === void 0) {
    return 0;
  }

  if (left === void 0) {
    return -1;
  }

  if (right === void 0) {
    return 1;
  }

  return left.localeCompare(right);
};

const normalize = (value: number): -1 | 0 | 1 => {
  if (value < 0) {
    return -1;
  }

  if (value > 0) {
    return 1;
  }

  return 0;
};

export const comparePosition = (left: IPosition, right: IPosition): -1 | 0 | 1 => {
  const diffLine = left.line - right.line;

  if (diffLine !== 0) {
    return normalize(diffLine);
  }

  const diffChar = left.character - right.character;

  return normalize(diffChar);
};

export const compareResults = (left: ISpectralDiagnostic, right: ISpectralDiagnostic): -1 | 0 | 1 => {
  const diffSource = compareSource(left.source, right.source);

  if (diffSource !== 0) {
    return normalize(diffSource);
  }

  const diffStart = comparePosition(left.range.start, right.range.start);

  if (diffStart !== 0) {
    return diffStart;
  }

  const diffCode = compareCode(left.code, right.code);

  if (diffCode !== 0) {
    return normalize(diffCode);
  }

  const diffPath = left.path.join().localeCompare(right.path.join());

  return normalize(diffPath);
};

export const sortResults = (results: ISpectralDiagnostic[]): ISpectralDiagnostic[] => {
  return [...results].sort(compareResults);
};
