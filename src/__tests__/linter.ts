import { ValidationSeverity, ValidationSeverityLabel } from '@stoplight/types';

import { Spectral } from '../spectral';

const fnName = 'fake';
const fnName2 = 'fake2';
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
  example: {
    summary: '',
    given: '$.responses',
    then: {
      function: fnName,
    },
  },
};

describe('linter', () => {
  const spectral = new Spectral();

  test('should not lint if passing in value is not an object', () => {
    const fakeLintingFunction = jest.fn();
    spectral.addFunctions({
      [fnName]: fakeLintingFunction,
    });
    spectral.addRules(rules);

    // @ts-ignore
    const result = spectral.run(123);

    expect(result.results.length).toBe(0);
  });

  test('should return extra properties', () => {
    const message = '4xx responses require a description';

    spectral.addFunctions({
      func1: val => {
        if (!val) {
          return [
            {
              message,
            },
          ];
        }

        return;
      },
    });

    spectral.addRules({
      rule1: {
        given: '$.responses[*]',
        when: {
          field: '@key',
          pattern: '^4.*',
        },
        then: {
          field: 'description',
          function: 'func1',
        },
      },
    });

    const result = spectral.run({
      responses: {
        '200': {
          name: 'ok',
        },
        '404': {
          name: 'not found',
        },
      },
    });

    expect(result.results[0]).toEqual({
      name: 'rule1',
      message,
      severity: ValidationSeverity.Error,
      severityLabel: ValidationSeverityLabel.Error,
      path: ['responses', '404', 'description'],
    });
  });

  describe('functional tests for the given property', () => {
    let fakeLintingFunction: any;

    beforeEach(() => {
      fakeLintingFunction = jest.fn();
      spectral.addFunctions({
        [fnName]: fakeLintingFunction,
      });
      spectral.addRules(rules);
    });

    describe('when given path is set', () => {
      test('should pass given path through to lint function', () => {
        spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
        expect(fakeLintingFunction.mock.calls[0][2].given).toEqual(['responses']);
        expect(fakeLintingFunction.mock.calls[0][3].given).toEqual(target.responses);
      });
    });

    describe('when given path is not set', () => {
      test('should pass through root object', () => {
        spectral.addRules({
          example: {
            summary: '',
            given: '$',
            then: {
              function: fnName,
            },
          },
        });
        spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
        expect(fakeLintingFunction.mock.calls[0][2].given).toEqual([]);
        expect(fakeLintingFunction.mock.calls[0][3].given).toEqual(target);
      });
    });
  });

  describe('functional tests for the when statement', () => {
    let fakeLintingFunction: any;

    beforeEach(() => {
      fakeLintingFunction = jest.fn();
      spectral.addFunctions({
        [fnName]: fakeLintingFunction,
      });
      spectral.addRules(rules);
    });

    describe('given no when', () => {
      test('should simply lint anything it matches in the given', () => {
        spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
        expect(fakeLintingFunction.mock.calls[0][0]).toEqual(target.responses);
      });
    });

    describe('given when with no pattern and regular field', () => {
      test('should call linter if when field exists', () => {
        spectral.mergeRules({
          example: {
            when: {
              field: '200.description',
            },
          },
        });
        spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
        expect(fakeLintingFunction.mock.calls[0][0]).toEqual({
          '200': { description: 'a' },
          '201': { description: 'b' },
          '300': { description: 'c' },
        });
      });

      test('should not call linter if when field not exist', () => {
        spectral.mergeRules({
          example: {
            when: {
              field: '302.description',
            },
          },
        });
        spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(0);
      });
    });

    describe('given "when" with a pattern and regular field', () => {
      test('should NOT lint if pattern does not match', () => {
        spectral.mergeRules({
          example: {
            when: {
              field: '200.description',
              pattern: 'X',
            },
          },
        });
        spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(0);
      });

      test('should lint if pattern does match', () => {
        spectral.mergeRules({
          example: {
            when: {
              field: '200.description',
              pattern: 'a',
            },
          },
        });
        spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
        expect(fakeLintingFunction.mock.calls[0][0]).toEqual({
          '200': { description: 'a' },
          '201': { description: 'b' },
          '300': { description: 'c' },
        });
      });
    });

    describe('given "when" with a pattern and @key field', () => {
      test('should lint ONLY part of object that matches pattern', () => {
        spectral.mergeRules({
          example: {
            given: '$.responses[*]',
            when: {
              field: '@key',
              pattern: '2..',
            },
          },
        });
        spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(2);
        expect(fakeLintingFunction.mock.calls[0][0]).toEqual({
          description: 'a',
        });
      });
    });
  });

  describe('functional tests for the then statement', () => {
    let fakeLintingFunction: any;
    let fakeLintingFunction2: any;

    beforeEach(() => {
      fakeLintingFunction = jest.fn();
      fakeLintingFunction2 = jest.fn();
      spectral.addFunctions({
        [fnName]: fakeLintingFunction,
        [fnName2]: fakeLintingFunction2,
      });
      spectral.addRules({
        example: {
          summary: '',
          given: '$.responses',
          then: [
            {
              function: fnName,
              functionOptions: {
                func1Prop: '1',
              },
            },
            {
              field: '200',
              function: fnName2,
              functionOptions: {
                func2Prop: '2',
              },
            },
          ],
        },
      });
    });

    describe('given list of then objects', () => {
      test('should call each one with the appropriate args', () => {
        spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
        expect(fakeLintingFunction.mock.calls[0][0]).toEqual(target.responses);
        expect(fakeLintingFunction.mock.calls[0][1]).toEqual({
          func1Prop: '1',
        });

        expect(fakeLintingFunction2).toHaveBeenCalledTimes(1);
        expect(fakeLintingFunction2.mock.calls[0][0]).toEqual(target.responses['200']);
        expect(fakeLintingFunction2.mock.calls[0][1]).toEqual({
          func2Prop: '2',
        });
      });
    });

    describe('given many then field matches', () => {
      test('should call each one with the appropriate args', () => {
        spectral.addRules({
          example: {
            summary: '',
            given: '$.responses',
            then: {
              field: '$..description',
              function: fnName,
            },
          },
        });

        spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(3);
        expect(fakeLintingFunction.mock.calls[0][0]).toEqual('a');
        expect(fakeLintingFunction.mock.calls[1][0]).toEqual('b');
        expect(fakeLintingFunction.mock.calls[2][0]).toEqual('c');
      });
    });
  });
});
