jest.mock('../../fs/reader');

import { Dictionary } from '@stoplight/types/basic';
import { when } from 'jest-when';
import { IRule } from '../..';
import Lint from '../../cli/commands/lint';
import { readParsable } from '../../fs/reader';
import { IRulesetFile } from '../../types/ruleset';
import { readRuleset } from '../reader';

const readParsableMock: jest.Mock = readParsable as jest.Mock;

const simpleRule: IRule = {
  enabled: false,
  given: 'abc',
  then: {
    function: 'f',
  },
};

const command = {} as Lint;

describe('reader', () => {
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

    expect(await readRuleset('flat-ruleset.yaml', command)).toEqual({
      'rule-1': { given: 'abc', then: { function: 'f' }, enabled: false },
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

    expect(await readRuleset('oneParentRuleset', command)).toEqual({
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

    expect(await readRuleset('oneParentRuleset', command)).toEqual({
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

    expect(await readRuleset('oneParentRuleset', command)).toEqual({
      'rule-1': { given: 'abc', then: { function: 'f' }, enabled: false },
      'rule-a': { given: 'given-a', then: { function: 'a' } },
      'rule-b': { given: 'given-b', then: { function: 'b' } },
      'common-rule': { given: 'common', then: { function: 'cb' } },
    });
  });

  function givenRulesets(rulesets: Dictionary<IRulesetFile, string>) {
    Object.entries(rulesets).forEach(([key, ruleset]) => {
      when(readParsableMock)
        .calledWith(key, 'utf8')
        .mockReturnValue({
          data: ruleset,
        });
    });
  }
});
