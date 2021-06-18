import { RulesetValidationError } from '../../ruleset';
import testFunction from './__helpers__/tester';
import xor from '../xor';

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

    it.each<[unknown, string]>([
      [
        null,
        '"xor" function has invalid options specified. Example valid options: { "properties": ["id", "name"] }, { "properties": ["country", "street"] }',
      ],
      [
        2,
        '"xor" function has invalid options specified. Example valid options: { "properties": ["id", "name"] }, { "properties": ["country", "street"] }',
      ],
      [{ properties: ['foo', 'bar'], foo: true }, '"xor" function does not support "foo" option'],
      [
        { properties: ['foo', 'bar', 'baz'] },
        '"xor" and its "properties" option support 2-item tuples, i.e. ["id", "name"]',
      ],
      [{ properties: ['foo', {}] }, '"xor" and its "properties" option support 2-item tuples, i.e. ["id", "name"]'],
      [{ properties: ['foo'] }, '"xor" and its "properties" option support 2-item tuples, i.e. ["id", "name"]'],
      [{ properties: [] }, '"xor" and its "properties" option support 2-item tuples, i.e. ["id", "name"]'],
    ])('given invalid %p options, should throw', async (opts, error) => {
      await expect(runXor({}, opts)).rejects.toThrow(new RulesetValidationError(error));
    });
  });
});
