import { get, reduce } from 'lodash';

export function countExistingProperties(object: any, properties: string[] | string[][]): number {
  return reduce<string | string[], number>(
    properties,
    (sum: number, prop: string | string[]) => {
      return typeof get(object, prop) === 'undefined' ? sum : sum + 1;
    },
    0
  );
}
