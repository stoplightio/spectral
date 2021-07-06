import { normalize } from '@stoplight/path';
import { truthy, pattern } from '@stoplight/spectral-functions';
import { DiagnosticSeverity } from '@stoplight/types';
import * as fs from 'fs';
import * as nock from 'nock';
import * as path from '@stoplight/path';
import * as Parsers from '@stoplight/spectral-parsers';
import { httpAndFileResolver } from '@stoplight/spectral-ref-resolver';

import { Document } from '../document';
import { Spectral } from '../spectral';

describe('Spectral', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  test('should report issues for correct files with correct ranges and paths', async () => {
    const documentUri = normalize(path.join(__dirname, './__fixtures__/document-with-external-refs.json'));
    const spectral = new Spectral({ resolver: httpAndFileResolver });
    spectral.setRuleset({
      rules: {
        'requires-type': {
          given: ['$..allOf', '$.empty'],
          then: {
            field: 'type',
            function: truthy,
          },
        },
      },
    });
    const document = new Document(fs.readFileSync(documentUri, 'utf8'), Parsers.Json, documentUri);

    const results = await spectral.run(document);

    expect(results).toEqual([
      {
        code: 'requires-type',
        message: '"empty.type" property must be truthy',
        path: ['empty'],
        range: {
          end: {
            character: 3,
            line: 6,
          },
          start: {
            character: 11,
            line: 4,
          },
        },
        severity: DiagnosticSeverity.Warning,
        source: documentUri,
      },
      {
        code: 'invalid-ref',
        message: 'EISDIR: illegal operation on a directory, read',
        path: ['empty', '$ref'],
        range: {
          end: {
            character: 14,
            line: 5,
          },
          start: {
            character: 12,
            line: 5,
          },
        },
        severity: DiagnosticSeverity.Error,
        source: documentUri,
      },
      {
        code: 'requires-type',
        message: '"allOf.type" property must be truthy',
        path: ['allOf'],
        range: {
          end: {
            character: 3,
            line: 33,
          },
          start: {
            character: 11,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Warning,
        source: expect.stringContaining('__fixtures__/models/todo-full.v1.json'),
      },
    ]);
  });

  test('properly decorates results with metadata pertaining to the document being linted', async () => {
    const s = new Spectral({ resolver: httpAndFileResolver });
    s.setRuleset({
      rules: {
        'unsecure-remote-reference': {
          message: '$ref must not point at unsecured remotes',
          given: '$..$ref',
          recommended: true,
          resolved: false,
          then: {
            function: pattern,
            functionOptions: {
              notMatch: '^http:',
            },
          },
        },
      },
    });

    nock('http://oas3.library.com')
      .get('/defs.json')
      .reply(
        200,
        JSON.stringify({
          openapi: '3.0.0',
          components: {
            schemas: {
              ExternalHttp: {
                type: 'number',
              },
              ExternalUnhooked: {
                type: 'object',
              },
            },
          },
        }),
      );

    const doc = {
      openapi: '3.0.0',
      paths: {
        '/path': {
          post: {
            parameters: [
              {
                $ref: '#/components/schemas/Hooked',
              },
              {
                $ref: 'http://oas3.library.com/defs.json#/components/schemas/ExternalHttp',
              },
            ],
          },
        },
      },
      components: {
        schemas: {
          Hooked: {
            type: 'object',
          },
          Unhooked: {
            type: 'object',
          },
        },
      },
    };

    const targetUri = 'test.json';

    const parsedResult = new Document(JSON.stringify(doc), Parsers.Json, targetUri);

    const results = await s.run(parsedResult, {});

    expect(results).toEqual([
      expect.objectContaining({
        code: 'unsecure-remote-reference',
        path: ['paths', '/path', 'post', 'parameters', '1', '$ref'],
        source: targetUri,
      }),
    ]);
  });

  test('should recognize the source of remote $refs, and de-dupe results by fingerprint', async () => {
    const s = new Spectral({ resolver: httpAndFileResolver });
    const documentUri = path.join(__dirname, './__fixtures__/gh-658/URIError.yaml');

    s.setRuleset({
      rules: {
        'schema-strings-maxLength': {
          severity: DiagnosticSeverity.Warning,
          recommended: true,
          message: "String typed properties MUST be further described using 'maxLength'. Error: {{error}}",
          given: "$..[?(@.type === 'string')]",
          then: {
            field: 'maxLength',
            function: truthy,
          },
        },
      },
    });

    const results = await s.run(new Document(fs.readFileSync(documentUri, 'utf8'), Parsers.Yaml, documentUri));

    expect(results.length).toEqual(3);

    return expect(results).toEqual([
      expect.objectContaining({
        path: ['components', 'schemas', 'Error', 'properties', 'status_code'],
        source: expect.stringContaining('/src/__tests__/__fixtures__/gh-658/lib.yaml'),
        range: {
          end: {
            character: 22,
            line: 21,
          },
          start: {
            character: 20,
            line: 20,
          },
        },
      }),

      expect.objectContaining({
        path: ['paths', '/test', 'get', 'responses', '200', 'content', 'application/json', 'schema'],
        source: expect.stringContaining('/src/__tests__/__fixtures__/gh-658/URIError.yaml'),
        range: {
          end: {
            character: 28,
            line: 23,
          },
          start: {
            character: 21,
            line: 22,
          },
        },
      }),

      expect.objectContaining({
        path: ['components', 'schemas', 'Foo'],
        source: expect.stringContaining('/src/__tests__/__fixtures__/gh-658/URIError.yaml'),
        range: {
          end: {
            character: 18,
            line: 43,
          },
          start: {
            character: 8,
            line: 42,
          },
        },
      }),
    ]);
  });
});
