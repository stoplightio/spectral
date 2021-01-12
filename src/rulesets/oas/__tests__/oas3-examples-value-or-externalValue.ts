import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { loadRules } from './__helpers__/loadRules';

describe('oas3-examples-value-or-externalValue', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await loadRules(['oas3-examples-value-or-externalValue']);
  });

  test('validate if just externalValue', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      components: { examples: { first: { externalValue: 'value' } } },
    });
    expect(results.length).toEqual(0);
  });

  test('validate if just value', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      components: { examples: { first: { value: 'value' } } },
    });
    expect(results.length).toEqual(0);
  });

  test('validate if example on top level', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      examples: { first: { value: 'value', externalValue: 'value' } },
    });
    expect(results.length).toEqual(0);
  });

  test('validate if examples properties in examples', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      components: {
        examples: {
          first: {
            value: {
              examples: {
                a: 'b',
              },
            },
          },
          second: {
            value: {
              components: {
                examples: {
                  value: 'value',
                  externalValue: 'value',
                },
              },
            },
          },
          third: {
            value: {
              examples: {
                a: 'b',
              },
            },
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('will not validate properties in schemas that are literally named example or examples', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      components: {
        schemas: {
          pet: {
            properties: {
              examples: {
                type: 'array',
              },
              example: {
                type: 'integer',
              },
            },
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('multiple examples - validate all value or externalValue', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      components: {
        examples: {
          first: { value: 'value1' },
          second: { externalValue: 'external-value2' },
          third: { value: 'value3' },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return warnings if missing externalValue and value', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      components: { examples: { first: {} } },
    });
    expect(results).toEqual([
      {
        code: 'oas3-examples-value-or-externalValue',
        message: 'Examples should have either a `value` or `externalValue` field.',
        path: ['components', 'examples', 'first'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('multiple examples - return warnings if missing externalValue and value in one', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      components: {
        examples: {
          first: { value: 'value1' },
          second: { externalValue: 'external-value2' },
          third: {},
        },
      },
    });
    expect(results).toEqual([
      {
        code: 'oas3-examples-value-or-externalValue',
        message: 'Examples should have either a `value` or `externalValue` field.',
        path: ['components', 'examples', 'third'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('return warnings if both externalValue and value', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      components: {
        examples: { first: { externalValue: 'externalValue', value: 'value' } },
      },
    });
    expect(results).toEqual([
      {
        code: 'oas3-examples-value-or-externalValue',
        message: 'Examples should have either a `value` or `externalValue` field.',
        path: ['components', 'examples', 'first'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('multiple examples - return warnings if both externalValue and value in one (in components)', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      components: {
        examples: {
          first: { value: 'value1' },
          second: { externalValue: 'external-value2', value: 'value2' },
          third: { externalValue: 'external-value3' },
        },
      },
    });
    expect(results).toEqual([
      {
        code: 'oas3-examples-value-or-externalValue',
        message: 'Examples should have either a `value` or `externalValue` field.',
        path: ['components', 'examples', 'second'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('multiple examples - return warnings if both externalValue and value in one (in headers)', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      components: {
        headers: {
          headerName: {
            examples: {
              first: { value: 'value1' },
              second: { externalValue: 'external-value2', value: 'value2' },
              third: { externalValue: 'external-value3' },
            },
          },
        },
      },
    });
    expect(results).toEqual([
      {
        code: 'oas3-examples-value-or-externalValue',
        message: 'Examples should have either a `value` or `externalValue` field.',
        path: ['components', 'headers', 'headerName', 'examples', 'second'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('multiple examples - return warnings if both externalValue and value in one (in parameters)', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      components: {
        parameters: {
          parameterName: {
            examples: {
              first: { value: 'value1' },
              second: { externalValue: 'external-value2', value: 'value2' },
              third: { externalValue: 'external-value3' },
            },
          },
        },
      },
    });
    expect(results).toEqual([
      {
        code: 'oas3-examples-value-or-externalValue',
        message: 'Examples should have either a `value` or `externalValue` field.',
        path: ['components', 'parameters', 'parameterName', 'examples', 'second'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('multiple examples - return warnings if both externalValue and value in one (in content)', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      paths: {
        '/path': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    examples: {
                      first: { value: 'value1' },
                      second: {
                        externalValue: 'external-value2',
                        value: 'value2',
                      },
                      third: { externalValue: 'external-value3' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    expect(results).toEqual([
      {
        code: 'oas3-examples-value-or-externalValue',
        message: 'Examples should have either a `value` or `externalValue` field.',
        path: ['paths', '/path', 'get', 'responses', '200', 'content', 'application/json', 'examples', 'second'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
