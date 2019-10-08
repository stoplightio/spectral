import { IRuleResult } from '../../types';

export const sortResults = (results: IRuleResult[]) => {
  return [...results].sort((resultA, resultB) => {
    const diff = resultA.range.start.line - resultB.range.start.line;

    if (diff === 0) {
      return resultA.range.start.character - resultB.range.start.character;
    }

    return diff;
  });
};
