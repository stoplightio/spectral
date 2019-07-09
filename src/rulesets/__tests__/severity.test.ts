import { DiagnosticSeverity } from '@stoplight/types/dist';
import { HumanReadableDiagnosticSeverity } from '../../types';
import { FileRulesetSeverity } from '../../types/ruleset';
import { DEFAULT_SEVERITY_LEVEL, getDiagnosticSeverity, getSeverityLevel } from '../severity';

// @oclif/test packages requires @types/mocha, therefore we have 2 packages coming up with similar typings
// TS is confused and prefers the mocha ones, so we need to instrument it to pick up the Jest ones
declare var test: jest.It;

describe('Ruleset severity', () => {
  describe('getDiagnosticSeverity', () => {
    test.each([
      ['off', -1],
      ['error', DiagnosticSeverity.Error],
      ['warn', DiagnosticSeverity.Warning],
      ['info', DiagnosticSeverity.Information],
      ['hint', DiagnosticSeverity.Hint],
    ])('should successfully match %s human readable severity', (human, severity) => {
      expect(getDiagnosticSeverity(human as HumanReadableDiagnosticSeverity)).toEqual(severity);
    });

    test.each([
      -1,
      DiagnosticSeverity.Error,
      DiagnosticSeverity.Warning,
      DiagnosticSeverity.Information,
      DiagnosticSeverity.Hint,
    ])('should understand diagnostic severity', severity => {
      expect(getDiagnosticSeverity(severity)).toEqual(severity);
    });
  });

  describe('getSeverityLevel', () => {
    describe('given invalid rule', () => {
      test('should return provided severity', () => {
        expect(getSeverityLevel({}, 'foo', DiagnosticSeverity.Information)).toEqual(DiagnosticSeverity.Information);
        expect(getSeverityLevel({ foo: false }, 'foo', DiagnosticSeverity.Hint)).toEqual(DiagnosticSeverity.Hint);
      });

      test('should override existing severity level if rule is incomplete', () => {
        expect(getSeverityLevel({ foo: DiagnosticSeverity.Error }, 'foo', DiagnosticSeverity.Information)).toEqual(
          DiagnosticSeverity.Information,
        );
      });

      test.each(['recommended', 'all'] as FileRulesetSeverity[])(
        'should respect disabled state if %s flag is given',
        flag => {
          expect(getSeverityLevel({ foo: false }, 'foo', flag)).toEqual(-1);
          expect(getSeverityLevel({ foo: -1 }, 'foo', flag)).toEqual(-1);
          expect(getSeverityLevel({ foo: 'off' }, 'foo', flag)).toEqual(-1);
        },
      );

      test.each(['recommended', 'all'] as FileRulesetSeverity[])(
        'should try preserve existing severity if %s flag is provided',
        flag => {
          expect(getSeverityLevel({ foo: DiagnosticSeverity.Warning }, 'foo', flag)).toEqual(
            DiagnosticSeverity.Warning,
          );
          expect(getSeverityLevel({ foo: 'error' }, 'foo', flag)).toEqual(DiagnosticSeverity.Error);
          expect(getSeverityLevel({ foo: true }, 'foo', flag)).toEqual(DEFAULT_SEVERITY_LEVEL);
        },
      );

      test.each(['recommended', 'all'] as FileRulesetSeverity[])(
        'should set a default severity when %s flag is provided and a rule is missing',
        flag => {
          expect(getSeverityLevel({}, 'foo', flag)).toEqual(DEFAULT_SEVERITY_LEVEL);
        },
      );
    });
  });
});
