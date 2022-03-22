export function parseUrlVariables(str: string): string[] | undefined {
  if (typeof str !== 'string') return;
  const variables = str.match(/{(.+?)}/g);
  if (!variables || variables.length === 0) return;
  return variables.map(v => v.slice(1, -1));
}

export function getMissingProps(arr: string[] = [], obj: Record<string, unknown> = {}) {
  if (!Object.keys(obj).length) return arr;
  return arr.filter(val => {
    return !obj.hasOwnProperty(val);
  });
}

export function getRedundantProps(arr: string[] = [], obj: Record<string, unknown> = {}) {
  if (!arr.length) return Object.keys(obj);
  return Object.keys(obj).filter(val => {
    return !arr.includes(val);
  });
}
