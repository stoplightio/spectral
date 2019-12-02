import testRule from './templates/_schema-example';

const ruleName = 'oas3-valid-header-schema-example';

describe(ruleName, () => testRule(ruleName, 'headers'));
