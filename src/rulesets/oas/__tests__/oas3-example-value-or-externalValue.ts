import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('oas3-example-value-or-externalValue', () => {
  const s = new Spectral();
  s.registerFormat('oas3', () => true);
  s.setRules({
    'oas3-example-value-or-externalValue': Object.assign(ruleset.rules['oas3-example-value-or-externalValue'], {
      recommended: true,
      type: RuleType[ruleset.rules['oas3-example-value-or-externalValue'].type],
    }),
  });

  test('validate if just externalValue', async () => {
    const results = await s.run({ components: { examples: { first: { externalValue: 'value' } } } });
    expect(results.length).toEqual(0);
  });

  test('validate if just value', async () => {
    const results = await s.run({ components: { examples: { first: { value: 'value' } } } });
    expect(results.length).toEqual(0);
  });

  test('validate if example on top level', async () => {
    const results = await s.run({ examples: { first: { value: 'value', externalValue: 'value' } } });
    expect(results.length).toEqual(0);
  });

  test('validate if examples properties in examples', async () => {
    const results = await s.run({
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

  test('multiple examples - validate all value or externalValue', async () => {
    const results = await s.run({
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
    const results = await s.run({ components: { examples: { first: {} } } });
    expect(results).toEqual([
      {
        code: 'oas3-example-value-or-externalValue',
        message: 'Example should have either a `value` or `externalValue` field.',
        path: ['components', 'examples', 'first'],
        range: {
          end: {
            character: 17,
            line: 3,
          },
          start: {
            character: 14,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('multiple examples - return warnings if missing externalValue and value in one', async () => {
    const results = await s.run({
      components: { examples: { first: { value: 'value1' }, second: { externalValue: 'external-value2' }, third: {} } },
    });
    expect(results).toEqual([
      {
        code: 'oas3-example-value-or-externalValue',
        message: 'Example should have either a `value` or `externalValue` field.',
        path: ['components', 'examples', 'third'],
        range: {
          end: {
            character: 17,
            line: 9,
          },
          start: {
            character: 14,
            line: 9,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('return warnings if both externalValue and value', async () => {
    const results = await s.run({
      components: { examples: { first: { externalValue: 'externalValue', value: 'value' } } },
    });
    expect(results).toEqual([
      {
        code: 'oas3-example-value-or-externalValue',
        message: 'Example should have either a `value` or `externalValue` field.',
        path: ['components', 'examples', 'first'],
        range: {
          end: {
            character: 24,
            line: 5,
          },
          start: {
            character: 14,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('multiple examples - return warnings if both externalValue and value in one (in components)', async () => {
    const results = await s.run({
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
        code: 'oas3-example-value-or-externalValue',
        message: 'Example should have either a `value` or `externalValue` field.',
        path: ['components', 'examples', 'second'],
        range: {
          end: {
            character: 25,
            line: 8,
          },
          start: {
            character: 15,
            line: 6,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('multiple examples - return warnings if both externalValue and value in one (in headers)', async () => {
    const results = await s.run({
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
        code: 'oas3-example-value-or-externalValue',
        message: 'Example should have either a `value` or `externalValue` field.',
        path: ['components', 'headers', 'headerName', 'examples', 'second'],
        range: {
          end: {
            character: 29,
            line: 10,
          },
          start: {
            character: 19,
            line: 8,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('multiple examples - return warnings if both externalValue and value in one (in parameters)', async () => {
    const results = await s.run({
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
        code: 'oas3-example-value-or-externalValue',
        message: 'Example should have either a `value` or `externalValue` field.',
        path: ['components', 'parameters', 'parameterName', 'examples', 'second'],
        range: {
          end: {
            character: 29,
            line: 10,
          },
          start: {
            character: 19,
            line: 8,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('multiple examples - return warnings if both externalValue and value in one (in content)', async () => {
    const results = await s.run({
      paths: {
        '/path': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    examples: {
                      first: { value: 'value1' },
                      second: { externalValue: 'external-value2', value: 'value2' },
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
        code: 'oas3-example-value-or-externalValue',
        message: 'Example should have either a `value` or `externalValue` field.',
        path: ['paths', '/path', 'get', 'responses', '200', 'content', 'application/json', 'examples', 'second'],
        range: {
          end: {
            character: 37,
            line: 14,
          },
          start: {
            character: 27,
            line: 12,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
