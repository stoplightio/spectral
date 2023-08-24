import '@stoplight/spectral-test-utils/matchers';

import { RulesetValidationError } from '@stoplight/spectral-core';
import testFunction from './__helpers__/tester';
import xor from '../xor';
import AggregateError = require('es-aggregate-error');

const runXor = testFunction.bind(null, xor);

describe('Core Functions / Xor', () => {
  it('given no properties, should return an error message', async () => {
    expect(
      await runXor(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['yada-yada', 'whatever'] },
      ),
    ).toEqual([
      {
        message: '"yada-yada" and "whatever" must not be both defined or both undefined',
        path: [],
      },
    ]);
  });

  it('given both properties, should return an error message', async () => {
    expect(
      await runXor(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['version', 'title'] },
      ),
    ).toEqual([
      {
        message: '"version" and "title" must not be both defined or both undefined',
        path: [],
      },
    ]);
  });

  it('given invalid input, should should no error message', async () => {
    return expect(await runXor(null, { properties: ['version', 'title'] })).toEqual([]);
  });

  it('given only one of the properties, should return no error message', async () => {
    expect(
      await runXor(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['something', 'title'] },
      ),
    ).toEqual([]);
  });

  describe('validation', () => {
    it.each([{ properties: ['foo', 'bar'] }])('given valid %p options, should not throw', async opts => {
      expect(await runXor([], opts)).toEqual([]);
    });

    it.each<[unknown, RulesetValidationError[]]>([
      [
        null,
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"xor" function has invalid options specified. Example valid options: { "properties": ["id", "name"] }, { "properties": ["country", "street"] }',
            ['rules', 'my-rule', 'then', 'functionOptions'],
          ),
        ],
      ],
      [
        2,
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"xor" function has invalid options specified. Example valid options: { "properties": ["id", "name"] }, { "properties": ["country", "street"] }',
            ['rules', 'my-rule', 'then', 'functionOptions'],
          ),
        ],
      ],
      [
        { properties: ['foo', 'bar'], foo: true },
        [
          new RulesetValidationError('invalid-function-options', '"xor" function does not support "foo" option', [
            'rules',
            'my-rule',
            'then',
            'functionOptions',
            'foo',
          ]),
        ],
      ],
      [
        { properties: ['foo', 'bar', 'baz'] },
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"xor" and its "properties" option support 2-item tuples, i.e. ["id", "name"]',
            ['rules', 'my-rule', 'then', 'functionOptions', 'properties'],
          ),
        ],
      ],
      [
        { properties: ['foo', {}] },
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"xor" and its "properties" option support 2-item tuples, i.e. ["id", "name"]',
            ['rules', 'my-rule', 'then', 'functionOptions', 'properties'],
          ),
        ],
      ],
      [
        { properties: ['foo'] },
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"xor" and its "properties" option support 2-item tuples, i.e. ["id", "name"]',
            ['rules', 'my-rule', 'then', 'functionOptions', 'properties'],
          ),
        ],
      ],
      [
        { properties: [] },
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"xor" and its "properties" option support 2-item tuples, i.e. ["id", "name"]',
            ['rules', 'my-rule', 'then', 'functionOptions', 'properties'],
          ),
        ],
      ],
    ])('given invalid %p options, should throw', async (opts, errors) => {
      await expect(runXor({}, opts)).rejects.toThrowAggregateError(new AggregateError(errors));
    });
  });
});
