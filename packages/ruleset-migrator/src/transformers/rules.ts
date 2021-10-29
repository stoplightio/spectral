import { builders as b, namedTypes } from 'ast-types';
import * as functions from '@stoplight/spectral-functions';
import createOrderedLiteral, { setOrder } from '@stoplight/ordered-object-literal';
import { DiagnosticSeverity } from '@stoplight/types';

import { Transformer } from '../types';
import { assertString } from '../validation';
import { Ruleset } from '../validation/types';

export { transformer as default };

const KNOWN_FUNCTIONS = Object.keys(functions);

const REPLACEMENTS: Record<string, string> = {
  'operation-2xx-response': 'operation-default-response',
  'oas3-unused-components-schema': 'oas3-unused-components',

  // 'operation-default-response': null, no replacement for it

  'oas2-valid-parameter-example': 'oas2-valid-schema-example',
  'oas2-valid-response-schema-example': 'oas2-valid-schema-example',
  'oas2-valid-definition-example': 'oas2-valid-schema-example',

  'oas2-valid-response-example': 'oas2-valid-media-example',

  'oas3-valid-oas-parameter-example': 'oas3-valid-media-example',
  'oas3-valid-oas-content-example': 'oas3-valid-media-example',
  'oas3-valid-oas-header-example': 'oas3-valid-media-example',

  'oas3-valid-header-schema-example': 'oas3-valid-schema-example',
  'oas3-valid-parameter-schema-example': 'oas3-valid-schema-example',
};

const SEVERITY_MAP: Record<string, DiagnosticSeverity | -1> = {
  error: DiagnosticSeverity.Error,
  warn: DiagnosticSeverity.Warning,
  info: DiagnosticSeverity.Information,
  hint: DiagnosticSeverity.Hint,
  off: -1,
};

function max(left: DiagnosticSeverity | string, right: DiagnosticSeverity | string): DiagnosticSeverity | string {
  const lSeverity = getDiagnosticSeverity(left);
  const rSeverity = getDiagnosticSeverity(right);
  if (rSeverity === -1) {
    return left;
  }

  return lSeverity > rSeverity ? right : left;
}

function getDiagnosticSeverity(severity: DiagnosticSeverity | string): DiagnosticSeverity | -1 {
  return Number.isNaN(Number(severity)) ? SEVERITY_MAP[severity] : Number(severity);
}

const transformer: Transformer = function (ctx) {
  ctx.hooks.add([
    /^$/,
    (_ruleset): void => {
      const ruleset = _ruleset as Ruleset;
      if (ruleset.rules === void 0) return;

      const { rules } = ruleset;

      // this is to make sure order of rules is preserved after transformation
      ruleset.rules = createOrderedLiteral(rules);
      const order = Object.keys(rules);

      for (const [i, key] of order.entries()) {
        if (!(key in REPLACEMENTS)) continue;
        if (typeof rules[key] === 'object') continue; // we do not touch new definitions (aka custom rules). If one defines a rule like operation-2xx-response in their own ruleset, we shouldn't touch it.
        const newName = REPLACEMENTS[key];
        if (newName in rules) {
          rules[newName] = max(String(rules[key]), String(rules[newName]));
        } else {
          rules[newName] ??= rules[key];
        }

        order[i] = newName;
        delete rules[key];
      }

      setOrder(rules, [...new Set([...order])]);
    },
  ]);

  ctx.hooks.add([
    /^\/rules\/[^/]+\/then\/(?:[0-9]+\/)?function$/,
    (value): namedTypes.Identifier | namedTypes.UnaryExpression => {
      assertString(value);

      if (KNOWN_FUNCTIONS.includes(value)) {
        return ctx.tree.addImport(value, '@stoplight/spectral-functions');
      }

      const alias = ctx.tree.scope.load(`function-${value}`);
      return alias !== void 0 ? b.identifier(alias) : b.unaryExpression('void', b.literal(0));
    },
  ]);
};
