/*eslint-env node*/
const fs = require('fs');
const path = require('path');

const scopes = ['repo', 'test-harness', 'deps-dev', ...fs.readdirSync(path.join(__dirname, './packages'))];

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [2, 'never'],
    'scope-enum': [2, 'always', scopes],
  },
};
