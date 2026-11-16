import { serveAssets } from '@stoplight/spectral-test-utils';
import type { IUriParser } from '@stoplight/json-ref-resolver/types';
import { createHttpAndFileResolver } from '..';

const fixtureDirectory = 'https://example.com/spectral-gh-2640';
const rootUri = `${fixtureDirectory}/openapi.json`;
const pathCount = 12;

const parameterFixtures = {
  TenantId: { name: 'tenantId', in: 'path', required: true, schema: { type: 'string' } },
  SampleId: { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
};

function createFixture(): { root: Record<string, unknown>; assets: Record<string, Record<string, unknown>> } {
  const paths: Record<string, unknown> = {};
  const schemas: Record<string, unknown> = {};
  const assets: Record<string, Record<string, unknown>> = {
    [`${fixtureDirectory}/parameters/tenant.json`]: parameterFixtures.TenantId,
    [`${fixtureDirectory}/parameters/sample.json`]: parameterFixtures.SampleId,
    [`${fixtureDirectory}/responses/invalid.json`]: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: { $ref: '../openapi.json#/components/schemas/Error' },
        },
      },
    },
    [`${fixtureDirectory}/schemas/error.json`]: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  };

  for (let index = 0; index < pathCount; index++) {
    const schemaName = `Sample${index}`;
    const pathName = `/tenants/{tenantId}/samples/${index}/{id}`;

    schemas[schemaName] = { $ref: `./schemas/sample-${index}.json` };
    paths[pathName] = { $ref: `./paths/sample-${index}.json` };
    assets[`${fixtureDirectory}/schemas/sample-${index}.json`] = {
      type: 'object',
      properties: { id: { type: 'integer' } },
    };
    assets[`${fixtureDirectory}/paths/sample-${index}.json`] = {
      get: {
        parameters: [
          { $ref: '../openapi.json#/components/parameters/TenantId' },
          { $ref: '../openapi.json#/components/parameters/SampleId' },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: { $ref: `../openapi.json#/components/schemas/${schemaName}` },
              },
            },
          },
          '400': { $ref: '../openapi.json#/components/responses/InvalidRequest' },
        },
      },
    };
  }

  const root = {
    openapi: '3.0.3',
    components: {
      parameters: {
        TenantId: { $ref: './parameters/tenant.json' },
        SampleId: { $ref: './parameters/sample.json' },
      },
      responses: {
        InvalidRequest: { $ref: './responses/invalid.json' },
      },
      schemas: {
        Error: { $ref: './schemas/error.json' },
        ...schemas,
      },
    },
    paths,
  };

  assets[rootUri] = root;

  return { root, assets };
}

describe('concurrent external references', () => {
  test('resolves every external root back-reference deterministically (gh-2640)', async () => {
    const { root, assets } = createFixture();
    serveAssets(assets);

    for (let attempt = 0; attempt < 10; attempt++) {
      const result = await createHttpAndFileResolver().resolve(root, {
        baseUri: rootUri,
        parseResolveResult: async (options: IUriParser) => {
          await new Promise(resolve => setTimeout(resolve, 0));

          return {
            ...options,
            result: JSON.parse(String(options.result)) as unknown,
          };
        },
      });
      const resolvedPaths = (result.result as { paths: Record<string, { get: { parameters: unknown[] } }> }).paths;

      expect(result.errors).toEqual([]);
      expect(Object.values(resolvedPaths).map(path => path.get.parameters)).toEqual(
        Array.from({ length: pathCount }, () => [parameterFixtures.TenantId, parameterFixtures.SampleId]),
      );
    }
  });
});
