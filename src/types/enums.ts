export enum RuleSeverity {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
}

export enum RuleType {
  VALIDATION = 'validation',
  STYLE = 'style',
}

export enum RuleFunction {
  ALPHABETICAL = 'alphabetical',
  MAX_LENGTH = 'maxLength',
  NOT_CONTAIN = 'notContain',
  NOT_END_WITH = 'notEndWith',
  OR = 'or',
  PATTERN = 'pattern',
  SCHEMA = 'schema',
  TRUTHY = 'truthy',
  XOR = 'xor',
  PARAM_CHECK = 'paramCheck',
}
