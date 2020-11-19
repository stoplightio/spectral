import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import { InvalidUriError } from '../../../rulesets/mergers/exceptions';
import { IExceptionLocation, pivotExceptions } from '../pivotExceptions';

import { buildRulesetExceptionCollectionFrom } from '../../../../setupTests';
import { Rule } from '../../../rule';

describe('pivotExceptions', () => {
  let dummyRule: Rule;

  beforeEach(() => {
    dummyRule = new Rule('', {
      severity: DiagnosticSeverity.Error,
      given: '',
      then: {
        function: 'truthy',
      },
    });
  });

  it('ignores exceptions for rules that are not part of the run', () => {
    const exceptions = {
      'one#/1': ['a', 'c'],
    };

    const runRules = { a: dummyRule };
    const expected: Dictionary<IExceptionLocation[], string> = {
      a: [{ source: 'one', path: ['1'] }],
    };

    expect(pivotExceptions(exceptions, runRules)).toEqual(expected);
  });

  it('returns a rule based dictionary', () => {
    const exceptions = {
      'one#/1': ['a', 'c'],
      'two#/2': ['b', 'd'],
      'three#/3': ['b', 'a'],
    };

    const runRules = { a: dummyRule, b: dummyRule, c: dummyRule, d: dummyRule };
    const expected: Dictionary<IExceptionLocation[], string> = {
      a: [
        { source: 'one', path: ['1'] },
        { source: 'three', path: ['3'] },
      ],
      b: [
        { source: 'two', path: ['2'] },
        { source: 'three', path: ['3'] },
      ],
      c: [{ source: 'one', path: ['1'] }],
      d: [{ source: 'two', path: ['2'] }],
    };

    expect(pivotExceptions(exceptions, runRules)).toEqual(expected);
  });

  const malformedLocations = [[''], ['#'], ['#a'], ['#/']];

  it.each(malformedLocations)('throws upon detected malformed location (%s)', malformed => {
    const bad = buildRulesetExceptionCollectionFrom(malformed);

    expect(() => {
      pivotExceptions(bad, {});
    }).toThrow(InvalidUriError);
  });
});
