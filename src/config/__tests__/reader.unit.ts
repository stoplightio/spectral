jest.mock('../../fs/reader');
jest.mock('../../formatters/ajv');
jest.mock('../validation');

import { Dictionary } from '@stoplight/types/basic';
import { when } from 'jest-when';
import { IRule } from '../..';
import Lint from '../../cli/commands/lint';
import { formatAjv } from '../../formatters/ajv';
import { readParsable } from '../../fs/reader';
import { IRulesetFile } from '../../types/ruleset';
import { readRuleset } from '../reader';
import { validateRuleset } from '../validation';

const readParsableMock: jest.Mock = readParsable as jest.Mock;
const formatAjvMock: jest.Mock = formatAjv as jest.Mock;
const validateRulesetMock: jest.Mock = validateRuleset as jest.Mock;

const simpleRule: IRule = {
  enabled: false,
  given: 'abc',
  then: {
    function: 'f',
  },
};

const command: Lint = {
  log: jest.fn(),
  error: jest.fn(),
} as any;

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

    expect(await readRuleset('flat-ruleset.yaml', command)).toEqual({
      'rule-1': { given: 'abc', then: { function: 'f' }, enabled: false },
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

    expect(await readRuleset('oneParentRuleset', command)).toEqual({
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

    expect(await readRuleset('oneParentRuleset', command)).toEqual({
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

    expect(await readRuleset('oneParentRuleset', command)).toEqual({
      'rule-1': { given: 'abc', then: { function: 'f' }, enabled: false },
      'rule-a': { given: 'given-a', then: { function: 'a' } },
      'rule-b': { given: 'given-b', then: { function: 'b' } },
      'common-rule': { given: 'common', then: { function: 'cb' } },
    });
  });

  it('given invalid ruleset should output errors', async () => {
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

    await readRuleset('flat-ruleset.yaml', command);

    expect(command.log).toHaveBeenCalledTimes(1);
    expect(command.log).toHaveBeenCalledWith('fake formatted message');
    expect(command.error).toHaveBeenCalledTimes(1);
    expect(command.error).toHaveBeenCalledWith(`Provided ruleset 'flat-ruleset.yaml' is not valid`, { exit: 1 });
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
