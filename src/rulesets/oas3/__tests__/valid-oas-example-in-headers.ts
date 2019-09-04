import testRule from './templates/_oas-example';

const ruleName = 'valid-oas-example-in-headers';

describe(ruleName, () => testRule(ruleName, 'headers'));
