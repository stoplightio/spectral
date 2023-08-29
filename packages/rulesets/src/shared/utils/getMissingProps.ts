export function getMissingProps(arr: string[], props: string[]): string[] {
  return arr.filter(val => {
    return !props.includes(val);
  });
}
