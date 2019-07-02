jest.mock('../../fs/reader');
jest.mock('../ajv');
jest.mock('../validation');
jest.mock('../path');
jest.mock('path');

import { Dictionary } from '@stoplight/types';
import { when } from 'jest-when';
import { dirname } from 'path';
import { IRule } from '../..';
import { readParsable } from '../../fs/reader';
import { IRulesetFile } from '../../types/ruleset';
import { resolvePath } from '../path';
import { readRulesFromRulesets } from '../reader';
import { assertValidRuleset } from '../validation';

const readParsableMock: jest.Mock = readParsable as jest.Mock;
const validateRulesetMock: jest.Mock = assertValidRuleset as jest.Mock;
const resolvePathMock: jest.Mock = resolvePath as jest.Mock;

const simpleRule: IRule = {
  enabled: false,
  given: 'abc',
  then: {
    function: 'f',
  },
};

describe('reader', () => {
  beforeEach(() => {
    validateRulesetMock.mockImplementation(given => given);
    (dirname as jest.Mock).mockImplementation(given => given);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('given flat, valid ruleset file should return rules', async () => {
    givenRulesets({
      'flat-ruleset.yaml': {
        rules: {
          'rule-1': simpleRule,
        },
      },
    });

    expect(await readRulesFromRulesets('flat-ruleset.yaml')).toEqual({
      'rule-1': { given: 'abc', then: { function: 'f' }, enabled: false },
    });
  });

  it('given two flat, valid ruleset files should return rules', async () => {
    givenRulesets({
      'flat-ruleset-a.yaml': {
        rules: {
          'rule-1': simpleRule,
        },
      },
      'flat-ruleset-b.yaml': {
        rules: {
          'rule-2': simpleRule,
        },
      },
    });

    expect(await readRulesFromRulesets('flat-ruleset-a.yaml', 'flat-ruleset-b.yaml')).toEqual({
      'rule-1': { given: 'abc', then: { function: 'f' }, enabled: false },
      'rule-2': { given: 'abc', then: { function: 'f' }, enabled: false },
    });
  });

  it('should override properties of extended rulesets', async () => {
    givenRulesets({
      flatRuleset: {
        rules: {
          'rule-1': simpleRule,
        },
      },
      oneParentRuleset: {
        extends: ['flatRuleset'],
        rules: {
          'rule-1': {
            ...simpleRule,
            // note that i'm enabling the rule here
            enabled: true,
          },
        },
      },
    });

    expect(await readRulesFromRulesets('oneParentRuleset')).toEqual({
      'rule-1': { given: 'abc', then: { function: 'f' }, enabled: true },
    });
  });

  it('should inherit properties of extended rulesets', async () => {
    givenRulesets({
      flatRuleset: {
        rules: {
          'rule-2': {
            given: 'another given',
            then: {
              function: 'b',
            },
          },
        },
      },
      oneParentRuleset: {
        extends: ['flatRuleset'],
        rules: {
          'rule-1': simpleRule,
        },
      },
    });

    expect(await readRulesFromRulesets('oneParentRuleset')).toEqual({
      'rule-1': { given: 'abc', then: { function: 'f' }, enabled: false },
      'rule-2': { given: 'another given', then: { function: 'b' } },
    });
  });

  it('should blend together parent rulesets', async () => {
    givenRulesets({
      rulesetA: {
        rules: {
          'rule-a': {
            given: 'given-a',
            then: {
              function: 'a',
            },
          },
          'common-rule': {
            given: 'common',
            then: {
              function: 'ca',
            },
          },
        },
      },
      rulesetB: {
        rules: {
          'rule-b': {
            given: 'given-b',
            then: {
              function: 'b',
            },
          },
          'common-rule': {
            given: 'common',
            then: {
              function: 'cb',
            },
          },
        },
      },
      oneParentRuleset: {
        extends: ['rulesetA', 'rulesetB'],
        rules: {
          'rule-1': simpleRule,
        },
      },
    });

    expect(await readRulesFromRulesets('oneParentRuleset')).toEqual({
      'rule-1': { given: 'abc', then: { function: 'f' }, enabled: false },
      'rule-a': { given: 'given-a', then: { function: 'a' } },
      'rule-b': { given: 'given-b', then: { function: 'b' } },
      'common-rule': { given: 'common', then: { function: 'cb' } },
    });
  });

  it('given invalid ruleset should output errors', () => {
    const flatRuleset = {
      rules: {
        'rule-1': simpleRule,
      },
    };
    givenRulesets({
      'flat-ruleset.yaml': flatRuleset,
    });
    validateRulesetMock.mockReset();
    validateRulesetMock.mockImplementationOnce(() => {
      throw new Error('fake errors');
    });

    return expect(readRulesFromRulesets('flat-ruleset.yaml')).rejects.toThrowError('fake errors');
  });

  function givenRulesets(rulesets: Dictionary<IRulesetFile, string>) {
    for (const [name, ruleset] of Object.entries(rulesets)) {
      for (const extend of ruleset.extends || []) {
        when(resolvePathMock)
          .calledWith(name, extend)
          .mockReturnValue(extend);
      }

      when(readParsableMock)
        .calledWith(name, 'utf-8')
        .mockReturnValue(JSON.stringify(ruleset));
    }
  }
});
