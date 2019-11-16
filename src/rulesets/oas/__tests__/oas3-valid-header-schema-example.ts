import testRule from './templates/_schema-example';

const ruleName = 'oas2-valid-header-schema-example';

describe(ruleName, () => testRule(ruleName, 'headers'));
