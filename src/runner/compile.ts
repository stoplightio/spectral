import * as jsep from 'jsep';
import { escapeRegExp } from 'lodash';

const { Parser } = require('./parser/parser');

export type CompiledExpression = {
  value: RegExp;
  singleMatch: boolean;
  deep: boolean;
};

const cache = new Map<string, CompiledExpression | null>([
  ['$', null],
  [
    '$..*',
    {
      deep: true,
      singleMatch: false,
      value: /./,
    },
  ],
]);

export function compile(path: string): CompiledExpression | null {
  const cachedValue = cache.get(path);
  if (cachedValue !== void 0) {
    return cachedValue;
  }

  try {
    const parser = new Parser();
    const ast = parser.parse(path);
    const segments: string[] = [];
    let singleMatch = true;
    let deep = false;

    for (const node of ast) {
      const { expression, operation, scope } = node;
      if (expression.type === 'root') continue;

      if (scope === 'descendant') {
        deep = true;
        segments.push('?.*');
      }

      switch (operation) {
        case 'member':
          switch (expression.type) {
            case 'root':
              break;
            case 'identifier':
              segments.push(escapeRegExp(expression.value));
              break;
            case 'wildcard':
              singleMatch = false;

              if (scope !== 'descendant') {
                segments.push('[^/]*');
              }

              break;
            default:
              throw new Error('Unsupported syntax');
          }

          break;

        case 'subscript':
          if (expression.type === 'wildcard') {
            deep = true;
            segments.push('[0-9]+');
          } else {
            segments.push(serializeFilterExpression(expression.value.replace(/^\?/, '')));
          }
          break;
        default:
          throw new Error('Unsupported syntax');
      }
    }

    let value: RegExp;
    if (ast.length === 2 && ast[1].scope === 'descendant') {
      value = new RegExp(`(?:^|\\/)${segments[1]}$`);
    } else {
      value = new RegExp(`^${segments.join('\\/')}$`);
    }

    const compiledExpression: CompiledExpression = {
      value,
      singleMatch: singleMatch && !deep,
      deep,
    };

    cache.set(path, compiledExpression);
    return compiledExpression;
  } catch {
    cache.set(path, null);
    return null;
  }
}

function serializeFilterExpression(expr: string) {
  return `(?:${serializeESTree(jsep(expr.replace(/^\?/, '').replace(/@property/g, '_property')))})`;
}

function serializeESTree(node: jsep.Expression): string {
  switch (node.type) {
    case 'LogicalExpression':
      if ((node as jsep.LogicalExpression).operator !== '||') {
        throw new Error('Unsupported syntax');
      }

      return `${serializeESTree((node as jsep.LogicalExpression).left)}|${serializeESTree(
        (node as jsep.LogicalExpression).right,
      )}`;

    case 'BinaryExpression':
      if ((node as jsep.BinaryExpression).operator !== '===' && (node as jsep.BinaryExpression).operator !== '==') {
        throw new Error('Unsupported syntax');
      }

      return (
        serializeESTree((node as jsep.BinaryExpression).left) + serializeESTree((node as jsep.BinaryExpression).right)
      );

    case 'Identifier':
      if ((node as jsep.Identifier).name === '_property') {
        return '';
      }

      throw new Error('Unsupported identifier');

    case 'Literal':
      if (typeof (node as jsep.Literal).value !== 'string' && typeof (node as jsep.Literal).value !== 'number') {
        throw new Error('Unsupported literal');
      }

      return escapeRegExp(String((node as jsep.Literal).value));
    default:
      throw new Error('Unsupported syntax');
  }
}

export function transformJsonPathsExpressions(
  expressions: string | string[],
): CompiledExpression | CompiledExpression[] | null {
  if (typeof expressions === 'string') {
    return compile(expressions);
  }

  const transformedExpressions: CompiledExpression[] = [];
  for (const item of expressions) {
    const compiled = compile(item);
    if (compiled !== null) {
      transformedExpressions.push(compiled);
    } else {
      return null;
    }
  }

  return transformedExpressions;
}
