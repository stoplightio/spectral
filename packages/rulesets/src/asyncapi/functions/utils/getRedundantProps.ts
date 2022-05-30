export function getRedundantProps(arr: string[] = [], obj: Record<string, unknown> = {}): string[] {
  if (!arr.length) return Object.keys(obj);
  return Object.keys(obj).filter(val => {
    return !arr.includes(val);
  });
}
