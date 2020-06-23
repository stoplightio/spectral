import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../../index';
import { rules } from '../../index.json';
import oasOpParams from '../oasOpParams';

describe('oasOpParams', () => {
  let s: Spectral;

  beforeEach(() => {
    s = new Spectral();
    s.setFunctions({ oasOpParams });
    s.setRules({
      'operation-parameters': Object.assign(rules['operation-parameters'], {
        recommended: true,
        type: RuleType[rules['operation-parameters'].type],
      }),
    });
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
        message: 'A parameter in this operation already exposes the same combination of `name` and `in` values.',
        path: ['paths', '/foo', 'get', 'parameters', '1'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'operation-parameters',
        message: 'A parameter in this operation already exposes the same combination of `name` and `in` values.',
        path: ['paths', '/foo', 'get', 'parameters', '2'],
        range: expect.any(Object),
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
        message: 'A parameter in this operation already exposes the same combination of `name` and `in` values.',
        path: ['paths', '/foo', 'get', 'parameters', '1'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'operation-parameters',
        message: 'A parameter in this operation already exposes the same combination of `name` and `in` values.',
        path: ['paths', '/foo', 'get', 'parameters', '2'],
        range: expect.any(Object),
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
    expect(results).toEqual([
      {
        code: 'operation-parameters',
        message: 'A parameter in this operation already exposes the same combination of `name` and `in` values.',
        path: ['paths', '/foo', 'get', 'parameters', '1'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'operation-parameters',
        message: 'A parameter in this operation already exposes the same combination of `name` and `in` values.',
        path: ['paths', '/foo', 'get', 'parameters', '3'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
      },
    ]);
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
    });
    expect(results).toEqual([
      {
        code: 'operation-parameters',
        message: 'Operation has already at least one instance of the `in:body` parameter.',
        path: ['paths', '/foo', 'get', 'parameters', '1'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'operation-parameters',
        message: 'Operation has already at least one instance of the `in:body` parameter.',
        path: ['paths', '/foo', 'put', 'parameters', '3'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'operation-parameters',
        message: 'Operation has already at least one instance of the `in:body` parameter.',
        path: ['paths', '/foo', 'put', 'parameters', '5'],
        range: expect.any(Object),
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
        message: 'Operation cannot have both `in:body` and `in:formData` parameters.',
        path: ['paths', '/foo', 'get', 'parameters'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
