import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../../index';
import { rules } from '../../index.json';
import oasOpParams from '../oasOpParams';

describe('oasOpParams', () => {
  const s = new Spectral();
  s.setFunctions({ oasOpParams });
  s.setRules({
    'operation-parameters': Object.assign(rules['operation-parameters'], {
      recommended: true,
      type: RuleType[rules['operation-parameters'].type],
    }),
  });

  test('No error if no params', async () => {
    const results = await s.run({
      paths: {
        '/foo': {
          get: {},
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('No error if only one param operation level', async () => {
    const results = await s.run({
      paths: {
        '/foo': {
          get: {
            parameters: [{ in: 'body', name: 'foo' }],
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('No error if same param on different operations', async () => {
    const results = await s.run({
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
    });
    expect(results.length).toEqual(0);
  });

  test('Error if non-unique param on same operation', async () => {
    const results = await s.run({
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
    });
    expect(results).toEqual([
      {
        code: 'operation-parameters',
        message: 'Operation parameters are unique and non-repeating.',
        path: ['paths', '/foo', 'get'],
        range: {
          end: {
            character: 25,
            line: 15,
          },
          start: {
            character: 12,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('Error if non-unique $ref param on same operation', async () => {
    const results = await s.run({
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
    });
    expect(results).toEqual([
      {
        code: 'operation-parameters',
        message: 'Operation parameters are unique and non-repeating.',
        path: ['paths', '/foo', 'get'],
        range: {
          end: {
            character: 44,
            line: 12,
          },
          start: {
            character: 12,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('Errors if multiple non-unique param on same operation', async () => {
    const results = await s.run({
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
    });
    expect(results.length).toEqual(1);
  });

  test('Error if multiple in:body', async () => {
    const results = await s.run({
      paths: {
        '/foo': {
          get: {
            parameters: [
              { in: 'body', name: 'foo' },
              { in: 'body', name: 'bar' },
            ],
          },
          put: {},
        },
      },
    });
    expect(results).toEqual([
      {
        code: 'operation-parameters',
        message: 'Operation parameters are unique and non-repeating.',
        path: ['paths', '/foo', 'get'],
        range: {
          end: {
            character: 25,
            line: 11,
          },
          start: {
            character: 12,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('Error if both in:formData and in:body', async () => {
    const results = await s.run({
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
    });
    expect(results).toEqual([
      {
        code: 'operation-parameters',
        message: 'Operation parameters are unique and non-repeating.',
        path: ['paths', '/foo', 'get'],
        range: {
          end: {
            character: 25,
            line: 11,
          },
          start: {
            character: 12,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
