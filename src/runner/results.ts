import type { IRuleResult } from '../types';
import type { IPosition } from '@stoplight/types';
import { DiagnosticSeverity } from '@stoplight/types';
import { Document, IDocument } from '../document';
import { DocumentInventory } from '../documentInventory';

export type ResultsContext = {
  document: DocumentInventory['document'];
  resolved: DocumentInventory['resolved'];
};

export class Results extends Array<IRuleResult> implements ReadonlyArray<IRuleResult> {
  static get [Symbol.species](): typeof Array {
    return Array;
  }

  #fingerprints = new Set<string>();

  public context: Readonly<ResultsContext>;

  public constructor(inventory: DocumentInventory) {
    super();
    this.context = {
      document: inventory.document,
      resolved: inventory.resolved,
    };
  }

  public push(...results: IRuleResult[]): number {
    return super.push(
      ...results.filter(result => {
        const fingerprint = computeResultFingerprint(result);
        if (!this.#fingerprints.has(fingerprint)) {
          this.#fingerprints.add(fingerprint);
          return true;
        }

        return false;
      }),
    );
  }

  public addRuntimeError(document: IDocument, code: IRuleResult['code'], message: string): number {
    return super.push({
      code,
      message,
      path: [],
      severity: DiagnosticSeverity.Error,
      ...(document.source !== null ? { source: document.source } : null),
      range: document.getRangeForJsonPath([], true) ?? Document.DEFAULT_RANGE,
    });
  }

  public sort(fn = compareResults): this {
    return super.sort(fn);
  }
}

const computeResultFingerprint = (result: IRuleResult): string => {
  let id = String(result.code);

  if (result.path.length > 0) {
    id += result.path.join('.');
  } else {
    const {
      range: { start, end },
    } = result;
    id += `[${start.line}:${start.character},${end.line}:${end.character}]`;
  }

  if (result.source !== void 0) {
    id += result.source;
  }

  return id;
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

const compareSource = (left: string | undefined, right: string | undefined): number =>
  compareCode(String(left), String(right));

const normalize = (value: number): -1 | 0 | 1 => Math.max(-1, Math.min(1, value)) as -1 | 0 | 1;

const comparePosition = (left: IPosition, right: IPosition): -1 | 0 | 1 => {
  const diffLine = left.line - right.line;

  if (diffLine !== 0) {
    return normalize(diffLine);
  }

  const diffChar = left.character - right.character;

  return normalize(diffChar);
};

function compareResults(left: IRuleResult, right: IRuleResult): -1 | 0 | 1 {
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
}
