import { DiagnosticSeverity } from '@stoplight/types';
import { RuleCollection, RuleFunction, RuleType } from '../../types';
import { ISchema } from './types';

export function noUndefRule(field: string) {
  return `${field}:no-undef`;
}

export function schemaToRuleCollection(schema: ISchema): RuleCollection {
  const ruleset: RuleCollection = {};
  Object.entries(schema).forEach(([key, value]) => {
    if (!value.optional) {
      ruleset[noUndefRule(key)] = {
        severity: DiagnosticSeverity.Error,
        type: RuleType.VALIDATION,
        summary: `'${key}' must be defined`,
        given: '$.rules[*]',
        then: {
          field: key,
          function: RuleFunction.TRUTHY,
        },
      };
    }
    switch (value.type) {
      case 'enum':
        break;
    }
  });
  return ruleset;
}
