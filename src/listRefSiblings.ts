import { DiagnosticSeverity, JsonPath } from '@stoplight/types/dist';
import { IParsedResult, IRuleResult } from './types';

function* siblingIterator(obj: object, path: JsonPath): IterableIterator<JsonPath> {
  const hasRef = '$ref' in obj;
  for (const key in obj) {
    if (!Object.hasOwnProperty.call(obj, key)) continue;
    const scopedPath = [...path, key];
    if (hasRef && key !== '$ref') {
      yield scopedPath;
    }

    if (key !== '$ref' && typeof obj[key] === 'object' && obj[key] !== null) {
      yield* siblingIterator(obj[key], scopedPath);
    }
  }
}

export const listRefSiblings = (result: IParsedResult): IRuleResult[] => {
  const list: IRuleResult[] = [];
  if (typeof result.parsed.data !== 'object' || result.parsed.data === null) return list;

  for (const path of siblingIterator(result.parsed.data, [])) {
    const { range } = result.getLocationForJsonPath(result.parsed, path, true)!;
    list.push({
      message: '$ref cannot have sibling',
      code: 'ref-sibling',
      range,
      source: result.source,
      severity: DiagnosticSeverity.Error,
      path,
    });
  }

  return list;
};
