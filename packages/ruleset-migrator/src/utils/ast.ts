import { builders as b, namedTypes } from 'ast-types';
import { safeStringify } from '@stoplight/json';

export function dumpJson(
  input: unknown,
): namedTypes.ArrayExpression | namedTypes.ObjectExpression | namedTypes.Literal {
  if (Array.isArray(input)) {
    return b.arrayExpression(input.map(dumpJson));
  } else if (typeof input === 'number' || typeof input === 'boolean' || typeof input === 'string') {
    return b.literal(input);
  } else if (typeof input !== 'object') {
    throw new Error(`Cannot dump ${safeStringify(input) ?? '<unknown value>'}`);
  }

  if (input === null) {
    return b.literal(null);
  }

  return b.objectExpression(
    Object.entries(input).map(([key, value]) => b.property('init', b.identifier(JSON.stringify(key)), dumpJson(value))),
  );
}

export function raiseError(value: unknown): namedTypes.CallExpression {
  return b.callExpression(b.identifier('ReferenceError'), [dumpJson(value)]);
}
