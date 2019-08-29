import testRule from './templates/_oas-example';

const ruleName = 'valid-oas-example-in-content';

describe(ruleName, () => testRule(ruleName, 'content'));
