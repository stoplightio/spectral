import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { IUriParser } from '@stoplight/json-ref-resolver/types';
import { createHttpAndFileResolver } from '..';

const pathCount = 40;
const parameters = {
  TenantId: { name: 'tenantId', in: 'path', required: true, schema: { type: 'string' } },
  SampleId: { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
};

describe('concurrent file references', () => {
  let fixtureDirectory: string;
  let rootUri: string;
  let root: Record<string, unknown>;

  beforeAll(() => {
    fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'spectral-gh-2640-'));
    rootUri = path.join(fixtureDirectory, 'openapi.json');

    for (const directory of ['parameters', 'paths', 'schemas']) {
      fs.mkdirSync(path.join(fixtureDirectory, directory));
    }

    fs.writeFileSync(path.join(fixtureDirectory, 'parameters', 'tenant.json'), JSON.stringify(parameters.TenantId));
    fs.writeFileSync(path.join(fixtureDirectory, 'parameters', 'sample.json'), JSON.stringify(parameters.SampleId));

    const paths: Record<string, unknown> = {};
    const schemas: Record<string, unknown> = {};

    for (let index = 0; index < pathCount; index++) {
      const schemaName = `Sample${index}`;
      const pathName = `/tenants/{tenantId}/samples/${index}/{id}`;

      schemas[schemaName] = { $ref: `./schemas/sample-${index}.json` };
      paths[pathName] = { $ref: `./paths/sample-${index}.json` };
      fs.writeFileSync(
        path.join(fixtureDirectory, 'schemas', `sample-${index}.json`),
        JSON.stringify({ type: 'object', properties: { id: { type: 'integer' } } }),
      );
      fs.writeFileSync(
        path.join(fixtureDirectory, 'paths', `sample-${index}.json`),
        JSON.stringify({
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
            },
          },
        }),
      );
    }

    root = {
      openapi: '3.0.3',
      components: {
        parameters: {
          TenantId: { $ref: './parameters/tenant.json' },
          SampleId: { $ref: './parameters/sample.json' },
        },
        schemas,
      },
      paths,
    };
    fs.writeFileSync(rootUri, JSON.stringify(root));
  });

  afterAll(() => {
    fs.rmSync(fixtureDirectory, { recursive: true, force: true });
  });

  test('resolves all root back-references on every run (gh-2640)', async () => {
    for (let attempt = 0; attempt < 10; attempt++) {
      const result = await createHttpAndFileResolver().resolve(root, {
        baseUri: rootUri,
        parseResolveResult: async (options: IUriParser) => ({
          ...options,
          result: JSON.parse(String(options.result)) as unknown,
        }),
      });
      const resolvedPaths = (result.result as { paths: Record<string, { get: { parameters: unknown[] } }> }).paths;

      expect(result.errors).toEqual([]);
      expect(Object.values(resolvedPaths).map(resolvedPath => resolvedPath.get.parameters)).toEqual(
        Array.from({ length: pathCount }, () => [parameters.TenantId, parameters.SampleId]),
      );
    }
  });
});
