import { DiagnosticSeverity } from '@stoplight/types';
import { Document } from '../../../document';
import { unreferencedReusableObject } from '../../../functions/unreferencedReusableObject';
import { RuleType, Spectral } from '../../../index';
import * as Parsers from '../../../parsers';
import { createHttpAndFileResolver } from '../../../resolvers/http-and-file';
import { rules } from '../index.json';

describe('oas2-unused-definition - local references', () => {
  const s = new Spectral({ resolver: createHttpAndFileResolver() });
  s.registerFormat('oas2', () => true);
  s.setFunctions({ unreferencedReusableObject });
  s.setRules({
    'oas2-unused-definition': Object.assign(rules['oas2-unused-definition'], {
      recommended: true,
      type: RuleType[rules['oas2-unused-definition'].type],
    }),
  });

  test('does not report anything for empty object', async () => {
    const results = await s.run({
      swagger: '2.0',
    });

    expect(results).toEqual([]);
  });

  test('does not throw when meeting an invalid json pointer', async () => {
    const doc = `{
      "swagger": "2.0",
      "x-hook": {
        "$ref": "'$#@!!!' What?"
      },
      "paths": {
      },
      "definitions": {
        "NotHooked": {
          "type": "object"
        }
      }
    }`;

    const results = await s.run(doc);

    expect(results).toEqual([
      expect.objectContaining({
        code: 'invalid-ref',
        path: ['x-hook', '$ref'],
      }),
      {
        code: 'oas2-unused-definition',
        message: 'Potentially unused definition has been detected.',
        path: ['definitions', 'NotHooked'],
        range: {
          end: {
            character: 26,
            line: 9,
          },
          start: {
            character: 20,
            line: 8,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('does not report anything when all the definitions are referenced', async () => {
    const doc = `{
      "swagger": "2.0",
      "x-hook": {
        "$ref": "#/definitions/Hooked"
      },
      "x-also-hook": {
        "$ref": "#/definitions/Hooked"
      },
      "paths": {
        "/path": {
          "post": {
            "parameters": [
              {
                "$ref": "#/definitions/HookedAsWell"
              }
            ]
          }
        }
      },
      "definitions": {
        "Hooked": {
          "type": "object"
        },
        "HookedAsWell": {
          "name": "value",
          "in": "query",
          "type": "number"
        }
      }
    }`;

    const results = await s.run(new Document(doc, Parsers.Json));

    expect(results).toEqual([]);
  });

  test('reports orphaned definitions', async () => {
    const doc = `{
      "swagger": "2.0",
      "paths": {
        "/path": {
          "post": {}
        }
      },
      "definitions": {
        "BouhouhouIamUnused": {
          "type": "object"
        }
      }
    }`;

    const results = await s.run(new Document(doc, Parsers.Json));

    expect(results).toEqual([
      {
        code: 'oas2-unused-definition',
        message: 'Potentially unused definition has been detected.',
        path: ['definitions', 'BouhouhouIamUnused'],
        range: {
          end: {
            character: 9,
            line: 10,
          },
          start: {
            character: 30,
            line: 8,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
