import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('oas3-operation-security-defined', [
  {
    name: 'validate a correct object (just in body)',
    document: {
      openapi: '3.0.2',
      components: {
        securitySchemes: {
          apikey: {},
        },
      },
      paths: {
        '/path': {
          get: {
            security: [
              {
                apikey: [],
              },
            ],
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'validate a correct object (API-level security)',
    document: {
      openapi: '3.0.2',
      components: {
        securitySchemes: {
          apikey: {},
        },
        security: [
          {
            apikey: [],
          },
        ],
      },
      paths: {
        '/path': {
          get: {},
        },
      },
    },
    errors: [],
  },

  {
    name: 'return errors on invalid object',
    document: {
      openapi: '3.0.2',
      components: {},
      paths: {
        '/path': {
          get: {
            security: [
              {
                apikey: [],
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: 'Operation "security" values must match a scheme defined in the "components.securitySchemes" object.',
        path: ['paths', '/path', 'get', 'security', '0', 'apikey'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'return errors on invalid object (API-level)',
    document: {
      openapi: '3.0.2',
      components: {},
      security: [
        {
          apikey: [],
        },
      ],
      paths: {
        '/path': {
          get: {},
        },
      },
    },
    errors: [
      {
        message: 'API "security" values must match a scheme defined in the "components.securitySchemes" object.',
        path: ['security', '0', 'apikey'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'return errors on valid and invalid object',
    document: {
      openapi: '3.0.2',
      components: {
        securitySchemes: {
          apikey: {},
        },
      },
      paths: {
        '/path': {
          get: {
            security: [
              {
                apikey: [],
                basic: [],
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: 'Operation "security" values must match a scheme defined in the "components.securitySchemes" object.',
        path: ['paths', '/path', 'get', 'security', '0', 'basic'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'valid and invalid object (API-level security)',
    document: {
      openapi: '3.0.2',
      components: {
        securitySchemes: {
          apikey: {},
        },
      },
      security: [
        {
          apikey: [],
          basic: [],
        },
      ],
      paths: {
        '/path': {
          get: {},
        },
      },
    },
    errors: [
      {
        message: 'API "security" values must match a scheme defined in the "components.securitySchemes" object.',
        path: ['security', '0', 'basic'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
