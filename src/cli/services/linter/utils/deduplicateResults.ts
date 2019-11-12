import { IRange } from '@stoplight/types/dist';
import { IRuleResult } from '../../../../types';

type Dictionary<T, K extends PropertyKey> = { [key in K]: T };

const ARTIFICIAL_ROOT = Symbol('root');

const serializeRange = ({ start, end }: IRange) => `${start.line}:${start.character}:${end.line}:${end.character}`;
const getIdentifier = (result: IRuleResult) => `${result.path.join('/')}${result.code}${serializeRange(result.range)}`;

export const deduplicateResults = (results: IRuleResult[]) => {
  const seen: Dictionary<Dictionary<string, string>, symbol> = {};

  return results.filter(result => {
    const source = result.source === void 0 ? ARTIFICIAL_ROOT : result.source;
    const identifier = getIdentifier(result);
    if (!(source in seen)) {
      seen[source] = {};
    } else if (identifier in seen[source]) {
      return false;
    }

    seen[source][identifier] = true;
    return true;
  });
};
