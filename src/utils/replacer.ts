import { Dictionary } from '@stoplight/types';
import { eval, parse } from 'expression-eval';

export type Transformer<V = object> = (this: V, ...args: unknown[]) => string;

export class Replacer<V extends object> {
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
      const shouldEvaluate = input[index] === '#';

      if (shouldEvaluate) {
        try {
          return String(
            eval(parse(identifier), {
              ...Object.entries(this.functions).reduce((fns, [name, fn]) => {
                fns[name] = fn.bind(values);
                return fns;
              }, {}),
              ...values,
            }),
          );
        } catch (ex) {
          console.warn(ex);
          return '';
        }
      }

      if (!(identifier in values)) {
        return '';
      }

      return String(values[identifier]);
    });
  }
}
