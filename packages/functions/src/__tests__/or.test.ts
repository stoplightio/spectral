import '@stoplight/spectral-test-utils/matchers';

import { RulesetValidationError } from '@stoplight/spectral-core';
import testFunction from './__helpers__/tester';
import or from '../or';
import AggregateError = require('es-aggregate-error');

const runOr = testFunction.bind(null, or);

describe('Core Functions / Or', () => {
  it('given no properties, should return an error message', async () => {
    expect(
      await runOr(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['yada-yada', 'whatever'] },
      ),
    ).toEqual([
      {
        message: 'At least one of "yada-yada" or "whatever" must be defined',
        path: [],
      },
    ]);
  });

  it('given both properties, should return no error message', async () => {
    expect(
      await runOr(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['version', 'title'] },
      ),
    ).toEqual([]);
  });

  it('given invalid input, should show no error message', async () => {
    return expect(await runOr(null, { properties: ['version', 'title'] })).toEqual([]);
  });

  it('given only one of the properties, should return no error message', async () => {
    expect(
      await runOr(
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
      await runOr(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['yada-yada'] },
      ),
    ).toEqual([
      {
        message: 'At least one of "yada-yada" must be defined',
        path: [],
      },
    ]);
  });

  it('given only one of 1 property, should return no error message', async () => {
    expect(
      await runOr(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['title'] },
      ),
    ).toEqual([]);
  });

  it('given one of 3 properties, should return no error message', async () => {
    expect(
      await runOr(
        {
          type: 'string',
          format: 'date',
        },
        { properties: ['default', 'pattern', 'format'] },
      ),
    ).toEqual([]);
  });

  it('given two of 3 properties, should return no error message', async () => {
    expect(
      await runOr(
        {
          type: 'string',
          default: '2024-05-01',
          format: 'date',
        },
        { properties: ['default', 'pattern', 'format'] },
      ),
    ).toEqual([]);
  });

  it('given three of 3 properties, should return no error message', async () => {
    expect(
      await runOr(
        {
          type: 'string',
          default: '2024-05-01',
          pattern: '\\d{4}-\\d{2}-\\d{2}',
          format: 'date',
        },
        { properties: ['default', 'pattern', 'format'] },
      ),
    ).toEqual([]);
  });

  it('given multiple of 5 properties, should return no error message', async () => {
    expect(
      await runOr(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['version', 'title', 'termsOfService', 'bar', 'five'] },
      ),
    ).toEqual([]);
  });

  it('given none of 5 properties, should return an error message', async () => {
    expect(
      await runOr(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['yada-yada', 'foo', 'bar', 'four', 'five'] },
      ),
    ).toEqual([
      {
        message: 'At least one of "yada-yada" or "foo" or "bar" or 2 other properties must be defined',
        path: [],
      },
    ]);
  });

  it('given only one of 4 properties, should return no error message', async () => {
    expect(
      await runOr(
        {
          version: '1.0.0',
          title: 'Swagger Petstore',
          termsOfService: 'http://swagger.io/terms/',
        },
        { properties: ['title', 'foo', 'bar', 'four'] },
      ),
    ).toEqual([]);
  });

  describe('validation', () => {
    it.each([{ properties: ['foo', 'bar'] }])('given valid %p options, should not throw', async opts => {
      expect(await runOr([], opts)).toEqual([]);
    });

    it.each([{ properties: ['foo'] }])('given valid %p options, should not throw', async opts => {
      expect(await runOr([], opts)).toEqual([]);
    });

    it.each([{ properties: ['foo', 'bar', 'three'] }])('given valid %p options, should not throw', async opts => {
      expect(await runOr([], opts)).toEqual([]);
    });

    it.each<[unknown, RulesetValidationError[]]>([
      [
        null,
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"or" function has invalid options specified. Example valid options: { "properties": ["id"] }, { "properties": ["default", "example"] }, { "properties": ["title", "summary", "description"] }, etc.',
            ['rules', 'my-rule', 'then', 'functionOptions'],
          ),
        ],
      ],
      [
        2,
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"or" function has invalid options specified. Example valid options: { "properties": ["id"] }, { "properties": ["default", "example"] }, { "properties": ["title", "summary", "description"] }, etc.',
            ['rules', 'my-rule', 'then', 'functionOptions'],
          ),
        ],
      ],
      [
        { properties: ['foo', 'bar'], foo: true },
        [
          new RulesetValidationError('invalid-function-options', '"or" function does not support "foo" option', [
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
            '"or" requires one or more enumerated "properties", i.e. ["id"], ["default", "example"], ["title", "summary", "description"], etc.',
            ['rules', 'my-rule', 'then', 'functionOptions', 'properties'],
          ),
        ],
      ],
      [
        { properties: [] },
        [
          new RulesetValidationError(
            'invalid-function-options',
            '"or" requires one or more enumerated "properties", i.e. ["id"], ["default", "example"], ["title", "summary", "description"], etc.',
            ['rules', 'my-rule', 'then', 'functionOptions', 'properties'],
          ),
        ],
      ],
    ])('given invalid %p options, should throw', async (opts, errors) => {
      await expect(runOr({}, opts)).rejects.toThrowAggregateError(new AggregateError(errors));
    });
  });
});
