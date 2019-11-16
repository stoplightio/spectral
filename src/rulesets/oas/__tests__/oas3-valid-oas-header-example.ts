import testRule from './templates/_oas-example';

const ruleName = 'oas3-valid-oas-header-example';

describe(ruleName, () => testRule(ruleName, 'headers'));
