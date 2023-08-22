type Variable = readonly [name: string, values: readonly string[]];
type ApplicableVariable = readonly [name: RegExp, encodedValues: readonly string[]];

export function* applyUrlVariables(url: string, variables: readonly Variable[]): Iterable<string> {
  yield* _applyUrlVariables(url, 0, variables.map(toApplicableVariable));
}

// this loosely follows https://datatracker.ietf.org/doc/html/rfc6570#section-3.2.2
function* _applyUrlVariables(url: string, i: number, variables: readonly ApplicableVariable[]): Iterable<string> {
  const [name, values] = variables[i];
  let x = 0;
  while (x < values.length) {
    const substitutedValue = url.replace(name, values[x]);

    if (i === variables.length - 1) {
      yield substitutedValue;
    } else {
      yield* _applyUrlVariables(substitutedValue, i + 1, variables);
    }

    x++;
  }
}

function toApplicableVariable([name, values]: Variable): ApplicableVariable {
  return [toReplaceRegExp(name), values.map(encodeURI)];
}

function toReplaceRegExp(name: string): RegExp {
  return RegExp(escapeRegexp(`{${name}}`), 'g');
}

// https://github.com/tc39/proposal-regex-escaping/blob/main/polyfill.js
function escapeRegexp(value: string): string {
  return value.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
}
