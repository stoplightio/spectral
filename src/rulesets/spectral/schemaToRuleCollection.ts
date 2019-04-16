import { DiagnosticSeverity } from '@stoplight/types';
import { RuleCollection, RuleFunction, RuleType } from '../../types';
import { ISchema } from './types';

export function noUndefRuleKey(field: string) {
  return `${field}:no-undef`;
}

export function enumRuleKey(field: string) {
  return `${field}:enum-value-match`;
}

export function schemaToRuleCollection(schema: ISchema): RuleCollection {
  const ruleset: RuleCollection = {};
  Object.entries(schema).forEach(([key, value]) => {
    if (!value.optional) {
      ruleset[noUndefRuleKey(key)] = noUndefRule(key);
    }
    switch (value.type) {
      case 'enum':
        ruleset[enumRuleKey(key)] = enumRule(key, value.values);
        break;
    }
  });
  return ruleset;
}

function enumRule(key: string, values: any[]) {
  return {
    severity: DiagnosticSeverity.Error,
    type: RuleType.VALIDATION,
    summary: `'${key}' must be one of '${values.join(', ')}'`,
    given: '$.rules[*]',
    then: {
      field: key,
      function: RuleFunction.ENUM,
      functionOptions: {
        values,
      },
    },
  };
}

function noUndefRule(key: string) {
  return {
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
