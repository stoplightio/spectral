export function getRedundantProps(arr: string[], keys: string[]): string[] {
  return keys.filter(val => {
    return !arr.includes(val);
  });
}
