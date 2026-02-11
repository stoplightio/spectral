import { Dictionary } from '@stoplight/types';
import { Parser, Value } from 'expr-eval-fork';

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
    const parser = new Parser();

    const functions = parser.functions as Record<string, (...args: Value[]) => Value>;
    functions.toUpperCase = (value: Value): Value => {
      return String(value).toUpperCase();
    };

    functions.concat = (...args: Value[]): Value => {
      return args.map(String).join('');
    };

    // Include custom functions in the whitelist
    const allowedFunctions = ['toUpperCase', 'concat'];
    Object.entries(this.functions).forEach(([name, fn]) => {
      functions[name] = fn.bind(values) as (...args: Value[]) => Value;
      allowedFunctions.push(name); // Add custom functions to the whitelist
    });

    const context = values as unknown as Record<string, Value>;

    return input.replace(this.regex, (_substr, identifier: string, index: number) => {
      if (index < 0 || index >= input.length) {
        return '';
      }

      const shouldEvaluate = input[index] === '#';

      if (shouldEvaluate) {
        let expression = identifier.trim();

        // Block dangerous patterns
        if (
          /constructor|process|require|global|mainModule|fs|child_process/.test(expression) ||
          !allowedFunctions.some(fn => expression.includes(fn))
        ) {
          // eslint-disable-next-line no-console
          console.error('Disallowed expression detected:', expression);
          return '';
        }

        try {
          expression = expression
            .replace(/(\S+)\.toUpperCase\(\)/g, 'toUpperCase($1)')
            .replace(/\s*\+\s*/g, ',')
            .replace(/^(.+)$/, 'concat($1)');

          return String(parser.evaluate(expression, context));
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Expression evaluation error:', error);
          return '';
        }
      }

      if (!(identifier in values)) {
        return '';
      }

      return String(values[identifier as keyof V]);
    });
  }
}
