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
        message: 'Exactly one of "yada-yada" or "whatever" must be defined',
        path: [],
      },
    ]);
  });

  it('given multiple properties that do not match, should return an error message', async () => {
    expect(
      await runXor(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['yada-yada', 'whatever', 'foo'] },
      ),
    ).toEqual([
      {
        message: 'Exactly one of "yada-yada" or "whatever" or "foo" must be defined',
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
        message: 'Just one of "version" and "title" must be defined',
        path: [],
      },
    ]);
  });

  it('given invalid input, should show no error message', async () => {
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

  it('given none of 1 property, should return an error message', async () => {
    expect(
      await runXor(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['yada-yada'] },
      ),
    ).toEqual([
      {
        message: 'Exactly one of "yada-yada" must be defined',
        path: [],
      },
    ]);
  });

  it('given only one of 1 property, should return no error message', async () => {
    expect(
      await runXor(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['title'] },
      ),
    ).toEqual([]);
  });

  it('given multiple of 5 properties, should return an error message', async () => {
    expect(
      await runXor(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['version', 'title', 'termsOfService', 'bar', 'five'] },
      ),
    ).toEqual([
      {
        message: 'Just one of "version" and "title" and "termsOfService" must be defined',
        path: [],
      },
    ]);
  });

  it('given none of 5 properties, should return an error message', async () => {
    expect(
      await runXor(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['yada-yada', 'foo', 'bar', 'four', 'five'] },
      ),
    ).toEqual([
      {
        message: 'Exactly one of "yada-yada" or "foo" or "bar" or 2 other properties must be defined',
        path: [],
      },
    ]);
  });

  it('given only one of 4 properties, should return no error message', async () => {
    expect(
      await runXor(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['title', 'foo', 'bar', 'four'] },
      ),
    ).toEqual([]);
  });

  it('given no properties, for non-exclusive or, should return an error message', async () => {
    expect(
      await runXor(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['yada-yada', 'whatever'], exclusive: false },
      ),
    ).toEqual([
      {
        message: 'At least one of "yada-yada" or "whatever" must be defined',
        path: [],
      },
    ]);
  });

  it('given both properties, for non-exclusive or, should return no error message', async () => {
    expect(
      await runXor(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['version', 'title'], exclusive: false },
      ),
    ).toEqual([]);
  });

  it('given invalid input, for non-exclusive or, should show no error message', async () => {
    return expect(await runXor(null, { properties: ['version', 'title'], exclusive: false })).toEqual([]);
  });

  it('given only one of the properties, for non-exclusive or, should return no error message', async () => {
    expect(
      await runXor(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['something', 'title'], exclusive: false },
      ),
    ).toEqual([]);
  });

  it('given none of 1 property, for non-exclusive or, should return an error message', async () => {
    expect(
      await runXor(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['yada-yada'], exclusive: false },
      ),
    ).toEqual([
      {
        message: 'At least one of "yada-yada" must be defined',
        path: [],
      },
    ]);
  });

  it('given only one of 1 property, for non-exclusive or, should return no error message', async () => {
    expect(
      await runXor(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['title'], exclusive: false },
      ),
    ).toEqual([]);
  });

  it('given one of 3 properties, for non-exclusive or, should return no error message', async () => {
    expect(
      await runXor(
        {
          type: 'string',
          format: 'date',
        },
        { properties: ['default', 'pattern', 'format'], exclusive: false },
      ),
    ).toEqual([]);
  });

  it('given two of 3 properties, for non-exclusive or, should return no error message', async () => {
    expect(
      await runXor(
        {
          type: 'string',
          default: '2024-05-01',
          format: 'date',
        },
        { properties: ['default', 'pattern', 'format'], exclusive: false },
      ),
    ).toEqual([]);
  });

  it('given three of 3 properties, for non-exclusive or, should return no error message', async () => {
    expect(
      await runXor(
        {
          type: 'string',
          default: '2024-05-01',
          pattern: '\\d{4}-\\d{2}-\\d{2}',
          format: 'date',
        },
        { properties: ['default', 'pattern', 'format'], exclusive: false },
      ),
    ).toEqual([]);
  });

  it('given multiple of 5 properties, for non-exclusive or, should return no error message', async () => {
    expect(
      await runXor(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['version', 'title', 'termsOfService', 'bar', 'five'], exclusive: false },
      ),
    ).toEqual([]);
  });

  it('given none of 5 properties, for non-exclusive or, should return an error message', async () => {
    expect(
      await runXor(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['yada-yada', 'foo', 'bar', 'four', 'five'], exclusive: false },
      ),
    ).toEqual([
      {
        message: 'At least one of "yada-yada" or "foo" or "bar" or 2 other properties must be defined',
        path: [],
      },
    ]);
  });

  it('given only one of 4 properties, for non-exclusive or, should return no error message', async () => {
    expect(
      await runXor(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['title', 'foo', 'bar', 'four'], exclusive: false },
      ),
    ).toEqual([]);
  });

  describe('validation for exclusive xor', () => {
    it.each([{ properties: ['foo', 'bar'] }])('given valid %p options, should not throw', async opts => {
      expect(await runXor([], opts)).toEqual([]);
    });

    it.each([{ properties: ['foo'] }])('given valid %p options, should not throw', async opts => {
      expect(await runXor([], opts)).toEqual([]);
    });

    it.each([{ properties: ['foo', 'bar', 'three'] }])('given valid %p options, should not throw', async opts => {
      expect(await runXor([], opts)).toEqual([]);
    });

    it.each<[unknown, RulesetValidationError[]]>([
      [
        null,
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"xor" function has invalid options specified. Example valid options: { "properties": ["id"] }, { "properties": ["value", "externalValue"], "exclusive": true }, { "properties": ["title", "summary", "description"], "exclusive": false }, etc.',
            ['rules', 'my-rule', 'then', 'functionOptions'],
          ),
        ],
      ],
      [
        2,
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"xor" function has invalid options specified. Example valid options: { "properties": ["id"] }, { "properties": ["value", "externalValue"], "exclusive": true }, { "properties": ["title", "summary", "description"], "exclusive": false }, etc.',
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
        { properties: ['foo', {}] },
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"xor" requires one or more enumerated "properties", i.e. ["id"], ["value", "externalValue"], ["title", "summary", "description"], etc.',
            ['rules', 'my-rule', 'then', 'functionOptions', 'properties'],
          ),
        ],
      ],
      [
        { properties: [] },
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"xor" requires one or more enumerated "properties", i.e. ["id"], ["value", "externalValue"], ["title", "summary", "description"], etc.',
            ['rules', 'my-rule', 'then', 'functionOptions', 'properties'],
          ),
        ],
      ],
    ])('given invalid %p options, should throw', async (opts, errors) => {
      await expect(runXor({}, opts)).rejects.toThrowAggregateError(new AggregateError(errors));
    });
  });

  describe('validation for non-exclusive or', () => {
    it.each([{ properties: ['foo', 'bar'], exclusive: true }])('given valid %p options, should not throw', async opts => {
      expect(await runXor([], opts)).toEqual([]);
    });

    it.each([{ properties: ['foo'], exclusive: false }])('given valid %p options, should not throw', async opts => {
      expect(await runXor([], opts)).toEqual([]);
    });

    it.each([{ properties: ['foo', 'bar', 'three'], exclusive: false }])('given valid %p options, should not throw', async opts => {
      expect(await runXor([], opts)).toEqual([]);
    });

    it.each<[unknown, RulesetValidationError[]]>([
      [
        null,
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"xor" function has invalid options specified. Example valid options: { "properties": ["id"] }, { "properties": ["value", "externalValue"], "exclusive": true }, { "properties": ["title", "summary", "description"], "exclusive": false }, etc.',
            ['rules', 'my-rule', 'then', 'functionOptions'],
          ),
        ],
      ],
      [
        2,
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"xor" function has invalid options specified. Example valid options: { "properties": ["id"] }, { "properties": ["value", "externalValue"], "exclusive": true }, { "properties": ["title", "summary", "description"], "exclusive": false }, etc.',
            ['rules', 'my-rule', 'then', 'functionOptions'],
          ),
        ],
      ],
      [
        { exclusive: false },
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"xor" function is missing "properties" option',
            ['rules', 'my-rule', 'then', 'functionOptions'],
          ),
        ],
      ],
      [
        { exclusive: "false" },
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"xor" function is missing "properties" option',
            ['rules', 'my-rule', 'then', 'functionOptions'],
          ),
          new RulesetValidationError(
            'invalid-function-options',
            '"xor" function and its "exclusive" option accepts only the following types: boolean',
            ['rules', 'my-rule', 'then', 'functionOptions', 'exclusive'],
          ),
        ],
      ],
      [
        { properties: ['foo', 'bar'], exclusive: "false" },
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"xor" function and its "exclusive" option accepts only the following types: boolean',
            ['rules', 'my-rule', 'then', 'functionOptions', 'exclusive'],
          ),
        ],
      ],
      [
        { properties: ['foo', 'bar'], foo: true, exclusive: false },
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
        { properties: ['foo', {}], exclusive: false },
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"xor" requires one or more enumerated "properties", i.e. ["id"], ["value", "externalValue"], ["title", "summary", "description"], etc.',
            ['rules', 'my-rule', 'then', 'functionOptions', 'properties'],
          ),
        ],
      ],
      [
        { properties: [], exclusive: false },
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"xor" requires one or more enumerated "properties", i.e. ["id"], ["value", "externalValue"], ["title", "summary", "description"], etc.',
            ['rules', 'my-rule', 'then', 'functionOptions', 'properties'],
          ),
        ],
      ],
    ])('given invalid %p options, should throw', async (opts, errors) => {
      await expect(runXor({}, opts)).rejects.toThrowAggregateError(new AggregateError(errors));
    });
  });
});
