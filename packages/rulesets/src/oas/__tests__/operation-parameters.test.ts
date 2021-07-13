import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('operation-parameters', [
  {
    name: 'No error if no params',
    document: {
      swagger: '2.0',
      paths: {
        '/foo': {
          get: {},
        },
      },
    },
    errors: [],
  },

  {
    name: 'No error if only one param operation level',
    document: {
      swagger: '2.0',
      paths: {
        '/foo': {
          get: {
            parameters: [{ in: 'body', name: 'foo' }],
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'No error if same param on different operations',
    document: {
      swagger: '2.0',
      paths: {
        '/foo': {
          get: {
            parameters: [{ in: 'body', name: 'foo' }],
          },
          put: {
            parameters: [{ in: 'body', name: 'foo' }],
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'Error if non-unique param on same operation',
    document: {
      swagger: '2.0',
      paths: {
        '/foo': {
          get: {
            parameters: [
              { in: 'query', name: 'foo' },
              { in: 'query', name: 'foo' },
              { in: 'query', name: 'foo' },
            ],
          },
          put: {},
        },
      },
    },
    errors: [
      {
        message: 'A parameter in this operation already exposes the same combination of "name" and "in" values.',
        path: ['paths', '/foo', 'get', 'parameters', '1'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'A parameter in this operation already exposes the same combination of "name" and "in" values.',
        path: ['paths', '/foo', 'get', 'parameters', '2'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'Error if non-unique $ref param on same operation',
    document: {
      swagger: '2.0',
      paths: {
        '/foo': {
          get: {
            parameters: [
              { $ref: '#/definitions/fooParam' },
              { $ref: '#/definitions/fooParam' },
              { $ref: '#/definitions/fooParam' },
            ],
          },
        },
      },
      definitions: {
        fooParam: {
          name: 'foo',
          in: 'query',
        },
      },
    },
    errors: [
      {
        message: 'A parameter in this operation already exposes the same combination of "name" and "in" values.',
        path: ['paths', '/foo', 'get', 'parameters', '1'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'A parameter in this operation already exposes the same combination of "name" and "in" values.',
        path: ['paths', '/foo', 'get', 'parameters', '2'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'Errors if multiple non-unique param on same operation',
    document: {
      swagger: '2.0',
      paths: {
        '/foo': {
          get: {
            parameters: [
              { in: 'query', name: 'foo' },
              { in: 'query', name: 'foo' },
              { in: 'header', name: 'bar' },
              { in: 'header', name: 'bar' },
            ],
          },
          put: {},
        },
      },
    },
    errors: [
      {
        message: 'A parameter in this operation already exposes the same combination of "name" and "in" values.',
        path: ['paths', '/foo', 'get', 'parameters', '1'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'A parameter in this operation already exposes the same combination of "name" and "in" values.',
        path: ['paths', '/foo', 'get', 'parameters', '3'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'Error if multiple in:body',
    document: {
      swagger: '2.0',
      paths: {
        '/foo': {
          get: {
            parameters: [
              { in: 'body', name: 'foo' },
              { in: 'body', name: 'bar' },
            ],
          },
          put: {
            parameters: [
              { in: 'body', name: 'foo' },
              { in: 'query', name: 'foo' },
              { in: 'header', name: 'bar' },
              { in: 'body', name: 'bar' },
              { in: 'header', name: 'baz' },
              { in: 'body', name: 'baz' },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: 'Operation must not have more than a single instance of the "in:body" parameter.',
        path: ['paths', '/foo', 'get', 'parameters', '1'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Operation must not have more than a single instance of the "in:body" parameter.',
        path: ['paths', '/foo', 'put', 'parameters', '3'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Operation must not have more than a single instance of the "in:body" parameter.',
        path: ['paths', '/foo', 'put', 'parameters', '5'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'Error if both in:formData and in:body',
    document: {
      swagger: '2.0',
      paths: {
        '/foo': {
          get: {
            parameters: [
              { in: 'body', name: 'foo' },
              { in: 'formData', name: 'bar' },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: 'Operation must not have both "in:body" and "in:formData" parameters.',
        path: ['paths', '/foo', 'get', 'parameters'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
