import { DiagnosticSeverity } from '@stoplight/types';
import { Document } from '../../../../document';
import { isOpenApiv2, isOpenApiv3_0, RuleType, Spectral } from '../../../../index';
import * as Parsers from '../../../../parsers';
import { rules as oasRules } from '../../../oas/index.json';
import refSiblings from '../refSiblings';

describe('refSiblings', () => {
  const s = new Spectral();
  s.setFunctions({ refSiblings });
  s.registerFormat('oas2.0', isOpenApiv2);
  s.registerFormat('oas3.0', isOpenApiv3_0);
  s.setRules({
    'no-$ref-siblings': Object.assign(oasRules['no-$ref-siblings'], {
      recommended: true,
      type: RuleType[oasRules['no-$ref-siblings'].type],
    }),
  });

  test('does not report anything for valid object', async () => {
    const results = await s.run({
      swagger: '2.0',
      securityDefinitions: {
        apikey: {},
      },
      paths: {
        '/path': {
          get: {
            security: [
              {
                apikey: [],
              },
            ],
          },
        },
      },
    });

    expect(results.length).toEqual(0);
  });

  test('reports $ref siblings for oas2 document', async () => {
    const doc = `{
  "swagger": "2.0",
  "securityDefinitions": {
    "apikey": {},
    "$ref": "#/securityDefinitions/apikey"
  },
  "paths": {
    "$ref": "#/securityDefinitions/apikey",
    "/path": {
      "post": {},
      "$ref": "#/foo/bar",
      "get": {
        "$ref": "#/da",
        "security": [
          {
            "apikey": []
          }
        ]
      }
    }
  }
}`;

    const results = await s.run(new Document(doc, Parsers.Json));

    expect([...results]).toEqual([
      {
        code: 'no-$ref-siblings',
        message: '$ref cannot be placed next to any other properties',
        path: ['securityDefinitions', 'apikey'],
        range: {
          end: {
            character: 16,
            line: 3,
          },
          start: {
            character: 14,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'no-$ref-siblings',
        message: '$ref cannot be placed next to any other properties',
        path: ['paths', '/path'],
        range: {
          end: {
            character: 5,
            line: 19,
          },
          start: {
            character: 13,
            line: 8,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'no-$ref-siblings',
        message: '$ref cannot be placed next to any other properties',
        path: ['paths', '/path', 'post'],
        range: {
          end: {
            character: 16,
            line: 9,
          },
          start: {
            character: 14,
            line: 9,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'no-$ref-siblings',
        message: '$ref cannot be placed next to any other properties',
        path: ['paths', '/path', 'get'],
        range: {
          end: {
            character: 7,
            line: 18,
          },
          start: {
            character: 13,
            line: 11,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'no-$ref-siblings',
        message: '$ref cannot be placed next to any other properties',
        path: ['paths', '/path', 'get', 'security'],
        range: {
          end: {
            character: 9,
            line: 17,
          },
          start: {
            character: 20,
            line: 13,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
    ]);
  });

  test('reports $ref siblings for oas3 document', async () => {
    const doc = `{
  "openapi": "3.0.0",
  "components": {
    "securityDefinitions": {
      "apikey": {},
      "$ref": "#/components/securityDefinitions/apikey"
    }
  },
  "paths": {
    "$ref": "#/components/securityDefinitions/apikey",
    "/path": {
      "post": {},
      "$ref": "#/foo/bar",
      "get": {
        "$ref": "#/da",
        "security": [
          {
            "apikey": []
          }
        ]
      }
    }
  }
}`;

    const results = await s.run(new Document(doc, Parsers.Json));

    expect([...results]).toEqual([
      {
        code: 'no-$ref-siblings',

        message: '$ref cannot be placed next to any other properties',
        path: ['components', 'securityDefinitions', 'apikey'],
        range: {
          end: {
            character: 18,
            line: 4,
          },
          start: {
            character: 16,
            line: 4,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'no-$ref-siblings',
        message: '$ref cannot be placed next to any other properties',
        path: ['paths', '/path'],
        range: {
          end: {
            character: 5,
            line: 21,
          },
          start: {
            character: 13,
            line: 10,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'no-$ref-siblings',
        message: '$ref cannot be placed next to any other properties',
        path: ['paths', '/path', 'post'],
        range: {
          end: {
            character: 16,
            line: 11,
          },
          start: {
            character: 14,
            line: 11,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'no-$ref-siblings',
        message: '$ref cannot be placed next to any other properties',
        path: ['paths', '/path', 'get'],
        range: {
          end: {
            character: 7,
            line: 20,
          },
          start: {
            character: 13,
            line: 13,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'no-$ref-siblings',
        message: '$ref cannot be placed next to any other properties',
        path: ['paths', '/path', 'get', 'security'],
        range: {
          end: {
            character: 9,
            line: 19,
          },
          start: {
            character: 20,
            line: 15,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
    ]);
  });
});
