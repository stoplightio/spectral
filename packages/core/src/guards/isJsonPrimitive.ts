export function isJsonPrimitive(maybeJsonPrimitive: unknown): maybeJsonPrimitive is number | string | boolean | null {
  return (
    maybeJsonPrimitive === null ||
    typeof maybeJsonPrimitive === 'number' ||
    typeof maybeJsonPrimitive === 'string' ||
    typeof maybeJsonPrimitive === 'boolean'
  );
}
