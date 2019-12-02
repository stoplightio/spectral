import testRule from './templates/_oas-example';

const ruleName = 'oas3-valid-oas-content-example';

describe(ruleName, () => testRule(ruleName, 'content'));
