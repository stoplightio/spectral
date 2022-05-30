export function getMissingProps(arr: string[] = [], obj: Record<string, unknown> = {}): string[] {
  if (!Object.keys(obj).length) return arr;
  return arr.filter(val => {
    return !Object.prototype.hasOwnProperty.call(obj, val);
  });
}
