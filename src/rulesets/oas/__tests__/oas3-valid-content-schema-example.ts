import testRule from './templates/_schema-example';

const ruleName = 'oas3-valid-content-schema-example';

describe(ruleName, () => testRule(ruleName, 'content'));
