import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('example-value-or-externalValue', () => {
  const s = new Spectral();
  s.setRules({
    'example-value-or-externalValue': Object.assign(ruleset.rules['example-value-or-externalValue'], {
      recommended: true,
      type: RuleType[ruleset.rules['example-value-or-externalValue'].type],
    }),
  });

  test('validate if just externalValue', async () => {
    const results = await s.run({ examples: { first: { externalValue: 'value' } } });
    expect(results.length).toEqual(0);
  });

  test('validate if just value', async () => {
    const results = await s.run({ examples: { first: { value: 'value' } } });
    expect(results.length).toEqual(0);
  });

  test('multiple examples - validate all value or externalValue', async () => {
    const results = await s.run({
      examples: {
        first: { value: 'value1' },
        second: { externalValue: 'external-value2' },
        third: { value: 'value3' },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return warnings if missing externalValue and value', async () => {
    const results = await s.run({ examples: { first: {} } });
    expect(results).toEqual([
      {
        code: 'example-value-or-externalValue',
        message: 'Example should have either a `value` or `externalValue` field.',
        path: ['examples', 'first'],
        range: {
          end: {
            character: 15,
            line: 2,
          },
          start: {
            character: 12,
            line: 2,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('multiple examples - return warnings if missing externalValue and value in one', async () => {
    const results = await s.run({
      examples: { first: { value: 'value1' }, second: { externalValue: 'external-value2' }, third: {} },
    });
    expect(results).toEqual([
      {
        code: 'example-value-or-externalValue',
        message: 'Example should have either a `value` or `externalValue` field.',
        path: ['examples', 'third'],
        range: {
          end: {
            character: 15,
            line: 8,
          },
          start: {
            character: 12,
            line: 8,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('return warnings if both externalValue and value', async () => {
    const results = await s.run({ examples: { first: { externalValue: 'externalValue', value: 'value' } } });
    expect(results).toEqual([
      {
        code: 'example-value-or-externalValue',
        message: 'Example should have either a `value` or `externalValue` field.',
        path: ['examples', 'first'],
        range: {
          end: {
            character: 22,
            line: 4,
          },
          start: {
            character: 12,
            line: 2,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('multiple examples - return warnings if both externalValue and value in one', async () => {
    const results = await s.run({
      examples: {
        first: { value: 'value1' },
        second: { externalValue: 'external-value2', value: 'value2' },
        third: { externalValue: 'external-value3' },
      },
    });
    expect(results).toEqual([
      {
        code: 'example-value-or-externalValue',
        message: 'Example should have either a `value` or `externalValue` field.',
        path: ['examples', 'second'],
        range: {
          end: {
            character: 23,
            line: 7,
          },
          start: {
            character: 13,
            line: 5,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
