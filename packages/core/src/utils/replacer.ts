import { Dictionary } from '@stoplight/types';
import { eval, parse } from 'expression-eval';

export type Transformer<V = Record<string, unknown>> = (this: V, ...args: unknown[]) => string;

export class Replacer<V extends Record<string, unknown>> {
  protected readonly regex: RegExp;
  protected readonly functions: Dictionary<Transformer<V>>;

  constructor(count: number) {
    this.regex = new RegExp(`#?${'{'.repeat(count)}([^}\n]+)${'}'.repeat(count)}`, 'g');

    this.functions = {};
  }

  public addFunction(name: string, filter: Transformer<V>): void {
    this.functions[name] = filter;
  }

  public print(input: string, values: V): string {
    return input.replace(this.regex, (substr, identifier, index) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const shouldEvaluate = input[index] === '#';

      if (shouldEvaluate) {
        return String(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          eval(parse(identifier), {
            ...Object.entries(this.functions).reduce((fns, [name, fn]) => {
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return String(values[identifier]);
    });
  }
}
