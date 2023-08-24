import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('oas2-operation-security-defined', [
  {
    name: 'a correct object (just in body)',
    document: {
      swagger: '2.0',
      securityDefinitions: {
        apikey: {},
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
    name: 'a correct object (API-level security)',
    document: {
      swagger: '2.0',
      securityDefinitions: {
        apikey: {},
      },
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
    errors: [],
  },

  {
    name: 'invalid object',
    document: {
      swagger: '2.0',
      securityDefinitions: {},
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
        message: 'Operation "security" values must match a scheme defined in the "securityDefinitions" object.',
        path: ['paths', '/path', 'get', 'security', '0', 'apikey'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'invalid object (API-level security)',
    document: {
      swagger: '2.0',
      securityDefinitions: {},
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
        message: 'API "security" values must match a scheme defined in the "securityDefinitions" object.',
        path: ['security', '0', 'apikey'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'valid and invalid object',
    document: {
      swagger: '2.0',
      securityDefinitions: {
        apikey: {},
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
        message: 'Operation "security" values must match a scheme defined in the "securityDefinitions" object.',
        path: ['paths', '/path', 'get', 'security', '0', 'basic'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'valid and invalid object (API-level security)',
    document: {
      swagger: '2.0',
      securityDefinitions: {
        apikey: {},
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
        message: 'API "security" values must match a scheme defined in the "securityDefinitions" object.',
        path: ['security', '0', 'basic'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
