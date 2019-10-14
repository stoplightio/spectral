import { getLocationForJsonPath, parseWithPointers } from '@stoplight/json';
import { DiagnosticSeverity } from '@stoplight/types';
import { FetchMockSandbox } from 'fetch-mock';
import { unreferencedReusableObject } from '../../../functions/unreferencedReusableObject';
import { RuleType, Spectral } from '../../../index';
import { httpAndFileResolver } from '../../../resolvers/http-and-file';
import { rules as oas2Rules } from '../../oas2/index.json';

describe('unusedDefinition - Http remote references', () => {
  let fetchMock: FetchMockSandbox;

  const s = new Spectral({ resolver: httpAndFileResolver });
  s.setFunctions({ unreferencedReusableObject });
  s.setRules({
    'unused-definition': Object.assign(oas2Rules['unused-definition'], {
      recommended: true,
      type: RuleType[oas2Rules['unused-definition'].type],
    }),
  });

  beforeEach(() => {
    fetchMock = require('fetch-mock').sandbox();
    window.fetch = fetchMock;
  });

  afterEach(() => {
    window.fetch = fetch;
  });

  test('reports unreferenced definitions', async () => {
    fetchMock.mock('https://oas2.library.com/defs.json', {
      status: 200,
      body: {
        definitions: {
          ExternalHttp: {
            type: 'number',
          },
        },
      },
    });

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
              },
              {
                "$ref": "https://oas2.library.com/defs.json#/definitions/ExternalHttp"
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
        },
        "Unhooked": {
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
        path: ['definitions', 'Unhooked'],
        range: {
          end: {
            character: 9,
            line: 33,
          },
          start: {
            character: 20,
            line: 31,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
