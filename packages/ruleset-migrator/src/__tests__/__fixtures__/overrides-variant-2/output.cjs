const { truthy } = require('@stoplight/spectral-functions');
const { oas } = require('@stoplight/spectral-rulesets');
module.exports = {
  extends: [oas],
  aliases: {
    OperationObject: ['#PathItem[get,put,post,delete,options,head,patch,trace]'],
    PathItem: ['$.paths[*]'],
  },
  overrides: [
    {
      files: ['*'],
      rules: {
        'operation-description': {
          given: '#OperationObject',
          then: {
            field: 'summary',
            function: truthy,
          },
          severity: 'warn',
        },
      },
    },
  ],
};
