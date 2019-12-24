import { Dictionary } from '@stoplight/types';

export type Transformer<V = unknown, VV = object> = (identifier: string, value: V, values: VV) => string;

export class Replacer<V extends object> {
  protected readonly regex: RegExp;
  protected readonly transformers: Dictionary<Transformer<V[keyof V], V>>;

  constructor(count: number) {
    this.regex = new RegExp(`${'{'.repeat(count)}([^}\n]+)${'}'.repeat(count)}`, 'g');

    this.transformers = {};
  }

  public addTransformer(name: string, filter: Transformer<V[keyof V], V>) {
    this.transformers[name] = filter;
  }

  public print(input: string, values: V) {
    return input.replace(this.regex, (substr, expr) => {
      const [identifier, ...transformers] = expr.split('|');

      if (!(identifier in values)) {
        return '';
      }

      for (const transformer of transformers) {
        if (transformer in this.transformers) {
          values[identifier] = this.transformers[transformer](identifier, values[identifier], values);
        }
      }

      return String(values[identifier]);
    });
  }
}
