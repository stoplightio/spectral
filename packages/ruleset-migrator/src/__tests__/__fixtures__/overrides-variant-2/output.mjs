import { truthy } from '@stoplight/spectral-functions';
import { oas } from '@stoplight/spectral-rulesets';
export default {
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
