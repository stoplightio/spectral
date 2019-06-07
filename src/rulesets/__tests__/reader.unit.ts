jest.mock('../../fs/reader');
jest.mock('../ajv');
jest.mock('../validation');
jest.mock('../path');

import { Dictionary } from '@stoplight/types/basic';
import { when } from 'jest-when';
import { IRule } from '../..';
import { readParsable } from '../../fs/reader';
import { IRulesetFile } from '../../types/ruleset';
import { formatAjv } from '../ajv';
import { resolvePath } from '../path';
import { readRulesFromRulesets } from '../reader';
import { validateRuleset } from '../validation';

const readParsableMock: jest.Mock = readParsable as jest.Mock;
const formatAjvMock: jest.Mock = formatAjv as jest.Mock;
const validateRulesetMock: jest.Mock = validateRuleset as jest.Mock;
const resolvePathMock: jest.Mock = resolvePath as jest.Mock;

const simpleRule: IRule = {
  enabled: false,
  given: 'abc',
  then: {
    function: 'f',
  },
};

describe('reader', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('given flat, valid ruleset file should return rules', async () => {
    validateRulesetMock.mockReturnValue([]);
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
    validateRulesetMock.mockReturnValue([]);
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
    validateRulesetMock.mockReturnValue([]);
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
    validateRulesetMock.mockReturnValue([]);
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
    validateRulesetMock.mockReturnValue([]);
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
    validateRulesetMock.mockReturnValue(['fake errors']);
    when(formatAjvMock)
      .calledWith(['fake errors'])
      .mockReturnValue('fake formatted message');

    return expect(readRulesFromRulesets('flat-ruleset.yaml')).rejects.toEqual({
      messages: ['fake formatted message', "Provided ruleset 'flat-ruleset.yaml' is not valid"],
    });
  });

  function givenRulesets(rulesets: Dictionary<IRulesetFile, string>) {
    Object.entries(rulesets).forEach(([key, ruleset]) => {
      (ruleset.extends || []).forEach(extend =>
        when(resolvePathMock)
          .calledWith(key, extend)
          .mockReturnValue(extend),
      );

      when(readParsableMock)
        .calledWith(key, 'utf8')
        .mockReturnValue({
          data: ruleset,
        });
    });
  }
});
