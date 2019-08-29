import testRule from './templates/_schema-example';

const ruleName = 'valid-schema-example-in-headers';

describe(ruleName, () => testRule(ruleName, 'headers'));
