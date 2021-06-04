import { normalize } from '@stoplight/path';
import { DiagnosticSeverity } from '@stoplight/types';
import * as fs from 'fs';
import * as nock from 'nock';
import * as path from '@stoplight/path';

import { Document } from '../document';
import { pattern } from '../functions/pattern';
import * as Parsers from '../parsers';
import { httpAndFileResolver } from '../resolvers/http-and-file';
import { Spectral } from '../spectral';

const bareRuleset = require('./__fixtures__/rulesets/bare.json');

describe('Spectral', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('loadRuleset', () => {
    it('should support loading rulesets from filesystem', async () => {
      const s = new Spectral();
      await s.loadRuleset(path.join(__dirname, '__fixtures__/rulesets/bare.json'));

      expect(s.rules).toEqual({
        'info-matches-stoplight': expect.objectContaining({
          message: bareRuleset.rules['info-matches-stoplight'].message,
          name: 'info-matches-stoplight',
          given: [bareRuleset.rules['info-matches-stoplight'].given],
          severity: DiagnosticSeverity.Warning,
        }),
      });

      Object.keys(s.exceptions).forEach(p => expect(path.isAbsolute(p)).toEqual(true));

      expect(Object.entries(s.exceptions)).toEqual([
        [expect.stringMatching('^/test/file.json#/info$'), ['info-contact', 'info-description']],
        [expect.stringMatching('^/test/file.json#$'), ['oas3-api-servers']],
        [expect.stringMatching('^/test/file.json#/paths/~1a.two/get$'), ['operation-success-response']],
        [expect.stringMatching('^/test/file.json#/paths/~1b.three/get$'), ['operation-success-response']],
        [expect.stringMatching('/__tests__/__fixtures__/rulesets/another.yaml#$'), ['dummy-rule', 'info-contact']],
      ]);
    });

    it('should support loading rulesets over http', async () => {
      const ruleset = {
        rules: {
          'info-matches-stoplight': {
            message: 'Info must contain Stoplight',
            given: '$.info',
            type: 'style',
            then: {
              field: 'title',
              function: 'pattern',
              functionOptions: {
                match: 'Stoplight',
              },
            },
          },
        },
      };

      nock('https://localhost:4000').get('/custom-ruleset').reply(200, JSON.stringify(ruleset));

      const s = new Spectral();
      await s.loadRuleset('https://localhost:4000/custom-ruleset');

      expect(s.rules).toEqual({
        'info-matches-stoplight': expect.objectContaining({
          message: bareRuleset.rules['info-matches-stoplight'].message,
          name: 'info-matches-stoplight',
          given: [bareRuleset.rules['info-matches-stoplight'].given],
          severity: DiagnosticSeverity.Warning,
        }),
      });
    });
  });

  it('should support combining built-in ruleset with a custom one', async () => {
    const s = new Spectral();
    await s.loadRuleset(['spectral:oas', path.join(__dirname, './__fixtures__/rulesets/bare.json')]);

    expect(Object.values(s.rules)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'oas2-schema',
        }),
        expect.objectContaining({
          name: 'oas3-schema',
        }),
        expect.objectContaining({
          name: 'info-matches-stoplight',
        }),
      ]),
    );
  });

  it('should report issues for correct files with correct ranges and paths', async () => {
    const documentUri = normalize(path.join(__dirname, './__fixtures__/document-with-external-refs.json'));
    const spectral = new Spectral({ resolver: httpAndFileResolver });
    spectral.setRules({
      'requires-type': {
        given: ['$..allOf', '$.empty'],
        then: {
          field: 'type',
          function: 'truthy',
        },
      },
    });
    const document = new Document(fs.readFileSync(documentUri, 'utf8'), Parsers.Json, documentUri);

    const results = await spectral.run(document);

    expect(results).toEqual([
      {
        code: 'requires-type',
        message: '`empty.type` property must be truthy',
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
        message: '`allOf.type` property must be truthy',
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

  it('properly decorates results with metadata pertaining to the document being linted', async () => {
    const s = new Spectral({ resolver: httpAndFileResolver });
    s.setFunctions({ pattern });
    s.setRules({
      'unsecure-remote-reference': {
        message: '$ref must not point at unsecured remotes',
        given: '$..$ref',
        recommended: true,
        resolved: false,
        then: {
          function: 'pattern',
          functionOptions: {
            notMatch: '^http:',
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

    const results = await s.run(parsedResult, {
      resolve: {
        documentUri: 'test.json',
      },
    });

    expect(results).toEqual([
      expect.objectContaining({
        code: 'unsecure-remote-reference',
        path: ['paths', '/path', 'post', 'parameters', '1', '$ref'],
        source: targetUri,
      }),
    ]);
  });

  it('should recognize the source of remote $refs, and de-dupe results by fingerprint', async () => {
    const s = new Spectral({ resolver: httpAndFileResolver });
    const documentUri = path.join(__dirname, './__fixtures__/gh-658/URIError.yaml');

    s.setRules({
      'schema-strings-maxLength': {
        severity: DiagnosticSeverity.Warning,
        recommended: true,
        message: "String typed properties MUST be further described using 'maxLength'. Error: {{error}}",
        given: "$..[?(@.type === 'string')]",
        then: {
          field: 'maxLength',
          function: 'truthy',
        },
      },
    });

    const results = await s.run(fs.readFileSync(documentUri, 'utf8'), {
      resolve: { documentUri },
    });

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
