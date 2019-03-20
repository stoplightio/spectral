import { Spectral } from '../../../../../index';
import { commonOasFunctions, commonOasRules } from '../../../index';

const ruleset = { functions: commonOasFunctions(), rules: commonOasRules() };

describe('oasOpParams', () => {
  const s = new Spectral();
  s.addFunctions(ruleset.functions || {});
  s.addRules({
    'operation-parameters': Object.assign(ruleset.rules['operation-parameters'], {
      enabled: true,
    }),
  });

  test('No error if no params', async () => {
    const results = await s.run({
      paths: {
        '/foo': {
          get: {},
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('No error if only one param operation level', async () => {
    const results = await s.run({
      paths: {
        '/foo': {
          get: {
            parameters: [{ in: 'body', name: 'foo' }],
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('No error if same param on different operations', async () => {
    const results = await s.run({
      paths: {
        '/foo': {
          get: {
            parameters: [{ in: 'body', name: 'foo' }],
          },
          put: {
            parameters: [{ in: 'body', name: 'foo' }],
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('Error if non-unique param on same operation', async () => {
    const results = await s.run({
      paths: {
        '/foo': {
          get: {
            parameters: [{ in: 'query', name: 'foo' }, { in: 'query', name: 'foo' }, { in: 'query', name: 'foo' }],
          },
          put: {},
        },
      },
    });
    expect(results).toMatchSnapshot();
  });

  test('Error if non-unique $ref param on same operation', async () => {
    const results = await s.run({
      paths: {
        '/foo': {
          get: {
            parameters: [
              { $ref: '#/definitions/fooParam' },
              { $ref: '#/definitions/fooParam' },
              { $ref: '#/definitions/fooParam' },
            ],
          },
        },
      },
      definitions: {
        fooParam: {
          name: 'foo',
          in: 'query',
        },
      },
    });
    expect(results).toMatchSnapshot();
  });

  test('Errors if multiple non-unique param on same operation', async () => {
    const results = await s.run({
      paths: {
        '/foo': {
          get: {
            parameters: [
              { in: 'query', name: 'foo' },
              { in: 'query', name: 'foo' },
              { in: 'header', name: 'bar' },
              { in: 'header', name: 'bar' },
            ],
          },
          put: {},
        },
      },
    });
    expect(results.length).toEqual(2);
  });

  test('Error if multiple in:body', async () => {
    const results = await s.run({
      paths: {
        '/foo': {
          get: {
            parameters: [{ in: 'body', name: 'foo' }, { in: 'body', name: 'bar' }],
          },
          put: {},
        },
      },
    });
    expect(results).toMatchSnapshot();
  });

  test('Error if both in:formData and in:body', async () => {
    const results = await s.run({
      paths: {
        '/foo': {
          get: {
            parameters: [{ in: 'body', name: 'foo' }, { in: 'formData', name: 'bar' }],
          },
        },
      },
    });
    expect(results).toMatchSnapshot();
  });
});
