import { getLocationForJsonPath, parseWithPointers } from '@stoplight/json';
import { DiagnosticSeverity } from '@stoplight/types';
import { unreferencedReusableObject } from '../../../functions/unreferencedReusableObject';
import { RuleType, Spectral } from '../../../index';
import { httpAndFileResolver } from '../../../resolvers/http-and-file';
import { rules as oas2Rules } from '../../oas2/index.json';

describe('unusedDefinition - Local references', () => {
  const s = new Spectral({ resolver: httpAndFileResolver });
  s.setFunctions({ unreferencedReusableObject });
  s.setRules({
    'unused-definition': Object.assign(oas2Rules['unused-definition'], {
      recommended: true,
      type: RuleType[oas2Rules['unused-definition'].type],
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
        code: 'unused-definition',
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

    const results = await s.run({
      parsed: parseWithPointers(doc),
      getLocationForJsonPath,
    });

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

    const results = await s.run({
      parsed: parseWithPointers(doc),
      getLocationForJsonPath,
    });

    expect(results).toEqual([
      {
        code: 'unused-definition',
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
