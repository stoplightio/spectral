export function* applyUrlVariables(
  url: string,
  variables: readonly [key: string, values: readonly string[]][],
): Iterable<string> {
  yield* _applyUrlVariables(url, 0, variables);
}

// this loosely follows https://datatracker.ietf.org/doc/html/rfc6570#section-3.2.2
function* _applyUrlVariables(
  url: string,
  i: number,
  variables: readonly [key: string, values: readonly string[]][],
): Iterable<string> {
  const [name, values] = variables[i];
  let x = 0;
  while (x < values.length) {
    // fixme: String.prototype.replaceAll is not available in Node 12 & 14
    const substitutedValue = url.replaceAll(`{${name}}`, encodeURI(values[x]));

    if (i === variables.length - 1) {
      yield substitutedValue;
    } else {
      yield* _applyUrlVariables(substitutedValue, i + 1, variables);
    }

    x++;
  }
}
