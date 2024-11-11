// @ts-expect-error: no types
import parse from 'nimma/parser';
// @ts-expect-error: needs new ts resolution
import reduce from 'simple-eval/eval';

export type Transformer<V = Record<string, unknown>> = (this: V, ...args: unknown[]) => string;

export class Replacer<V extends Record<string, unknown>> {
  protected readonly regex: RegExp;
  protected readonly functions: Record<string, Transformer<V>>;

  constructor(count: number) {
    this.regex = new RegExp(`#?${'{'.repeat(count)}([^}\n]+)${'}'.repeat(count)}`, 'g');

    this.functions = {};
  }

  public addFunction(name: string, filter: Transformer<V>): void {
    this.functions[name] = filter;
  }

  public print(input: string, values: V): string {
    return input.replace(this.regex, (substr, identifier: string, index: number) => {
      const shouldEvaluate = input[index] === '#';

      if (shouldEvaluate) {
        return String(
          simpleEval(identifier, {
            ...Object.entries(this.functions).reduce<Record<string, Transformer<V>>>((fns, [name, fn]) => {
              fns[name] = fn.bind(values);
              return fns;
            }, {}),
            ...values,
          }),
        );
      }

      if (!(identifier in values)) {
        return '';
      }

      return String(values[identifier]);
    });
  }
}

function simpleEval(expression: string, ctx: Record<string, unknown>): unknown {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return reduce(parse(`$[?(${expression})]`)[0].value, ctx);
}
