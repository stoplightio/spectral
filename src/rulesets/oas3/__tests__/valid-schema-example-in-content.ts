import testRule from './templates/_schema-example';

const ruleName = 'valid-schema-example-in-content';

describe(ruleName, () => testRule(ruleName, 'content'));
