import { merge } from 'lodash';
import { Spectral } from '../spectral';
import { RuleType } from '../types';

const format = 'oas';
const fnName = 'fake';
const spectral = new Spectral();
const target = {
  responses: {
    200: {
      description: 'a',
    },
    201: {
      description: 'b',
    },
    300: {
      description: 'c',
    },
  },
};
const rules = {
  [format]: {
    example: {
      description: '',
      enabled: true,
      given: '$.responses',
      summary: '',
      type: RuleType.VALIDATION,
      then: {
        function: fnName,
      },
    },
  },
};

describe('functional tests for the when statement', () => {
  let fakeLintingFunction: any;

  beforeEach(() => {
    fakeLintingFunction = jest.fn();
    spectral.setFunctions({
      [fnName]: fakeLintingFunction,
    });
  });

  describe('given no when', () => {
    test('should simply lint anything it matches in the given', () => {
      spectral.setRules(rules);

      spectral.run(target, {
        format,
      });

      expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
      expect(fakeLintingFunction.mock.calls[0][0].object).toEqual({
        '200': { description: 'a' },
        '201': { description: 'b' },
        '300': { description: 'c' },
      });
    });
  });

  describe('given when with no pattern and regular field', () => {
    test('should call linter if when field exists', () => {
      spectral.setRules(
        merge({}, rules, {
          [format]: {
            example: {
              when: {
                field: '200.description',
              },
            },
          },
        })
      );

      spectral.run(target, {
        format,
      });

      expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
      expect(fakeLintingFunction.mock.calls[0][0].object).toEqual({
        '200': { description: 'a' },
        '201': { description: 'b' },
        '300': { description: 'c' },
      });
    });

    test('should not call linter if when field not exist', () => {
      spectral.setRules(
        merge({}, rules, {
          [format]: {
            example: {
              when: {
                field: '302.description',
              },
            },
          },
        })
      );

      spectral.run(target, {
        format,
      });

      expect(fakeLintingFunction).toHaveBeenCalledTimes(0);
    });
  });

  describe('given when with no pattern and @key field', () => {
    test('should call linter if object has ANY keys', () => {
      spectral.setRules(
        merge({}, rules, {
          [format]: {
            example: {
              when: {
                field: '@key',
              },
            },
          },
        })
      );

      spectral.run(target, {
        format,
      });

      expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
      expect(fakeLintingFunction.mock.calls[0][0].object).toEqual({
        '200': { description: 'a' },
        '201': { description: 'b' },
        '300': { description: 'c' },
      });
    });

    test('should NOT call linter if object has NO keys', () => {
      spectral.setRules(
        merge({}, rules, {
          [format]: {
            example: {
              when: {
                field: '@key',
              },
            },
          },
        })
      );

      spectral.run(
        {
          responses: {},
        },
        {
          format,
        }
      );

      expect(fakeLintingFunction).toHaveBeenCalledTimes(0);
    });
  });

  describe('given "when" with a pattern and regular field', () => {
    test('should NOT lint if pattern does not match', () => {
      spectral.setRules(
        merge({}, rules, {
          [format]: {
            example: {
              when: {
                field: '200.description',
                pattern: 'X',
              },
            },
          },
        })
      );

      spectral.run(target, {
        format,
      });

      expect(fakeLintingFunction).toHaveBeenCalledTimes(0);
    });

    test('should lint if pattern does match', () => {
      spectral.setRules(
        merge({}, rules, {
          [format]: {
            example: {
              when: {
                field: '200.description',
                pattern: 'a',
              },
            },
          },
        })
      );

      spectral.run(target, {
        format,
      });

      expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
      expect(fakeLintingFunction.mock.calls[0][0].object).toEqual({
        '200': { description: 'a' },
        '201': { description: 'b' },
        '300': { description: 'c' },
      });
    });
  });

  describe('given "when" with a pattern and @key field', () => {
    test('should lint ONLY part of object that matches pattern', () => {
      spectral.setRules(
        merge({}, rules, {
          [format]: {
            example: {
              when: {
                field: '@key',
                pattern: '2..',
              },
            },
          },
        })
      );

      spectral.run(target, {
        format,
      });

      expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
      expect(fakeLintingFunction.mock.calls[0][0].object).toEqual({
        '200': { description: 'a' },
        '201': { description: 'b' },
      });
    });

    test('should work with arrays', () => {
      spectral.setRules(
        merge({}, rules, {
          [format]: {
            example: {
              when: {
                field: '@key',
                pattern: '[02]',
              },
            },
          },
        })
      );

      spectral.run(
        {
          responses: ['a', 'b', 'c', 'd', 'e'],
        },
        {
          format,
        }
      );

      expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
      expect(fakeLintingFunction.mock.calls[0][0].object).toEqual(['a', 'c']);
    });
  });
});
