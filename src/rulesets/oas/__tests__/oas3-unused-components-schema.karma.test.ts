import { getLocationForJsonPath, parseWithPointers } from '@stoplight/json';
import { DiagnosticSeverity } from '@stoplight/types';
import { FetchMockSandbox } from 'fetch-mock';
import { unreferencedReusableObject } from '../../../functions/unreferencedReusableObject';
import { RuleType, Spectral } from '../../../index';
import { httpAndFileResolver } from '../../../resolvers/http-and-file';
import { rules } from '../index.json';

describe('unusedComponentsSchema - Http remote references', () => {
  let fetchMock: FetchMockSandbox;

  const s = new Spectral({ resolver: httpAndFileResolver });
  s.registerFormat('oas3', () => true);
  s.setFunctions({ unreferencedReusableObject });
  s.setRules({
    'oas3-unused-components-schema': Object.assign(rules['oas3-unused-components-schema'], {
      recommended: true,
      type: RuleType[rules['oas3-unused-components-schema'].type],
    }),
  });

  beforeEach(() => {
    fetchMock = require('fetch-mock').sandbox();
    window.fetch = fetchMock;
  });

  afterEach(() => {
    window.fetch = fetch;
  });

  test('reports unreferenced components schemas', async () => {
    fetchMock.mock('https://oas3.library.com/defs.json', {
      status: 200,
      body: {
        components: {
          schemas: {
            ExternalHttp: {
              type: 'number',
            },
          },
        },
      },
    });

    const doc = `{
      "openapi": "3.0.0",
      "x-hook": {
        "$ref": "#/components/schemas/Hooked"
      },
      "x-also-hook": {
        "$ref": "#/components/schemas/Hooked"
      },
      "paths": {
        "/path": {
          "post": {
            "parameters": [
              {
                "$ref": "#/components/schemas/HookedAsWell"
              },
              {
                "$ref": "https://oas3.library.com/defs.json#/components/schemas/ExternalHttp"
              }
            ]
          }
        }
      },
      "components": {
        "schemas": {
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
      }
    }`;

    const results = await s.run({
      parsed: parseWithPointers(doc),
      getLocationForJsonPath,
    });

    expect(results).toEqual([
      {
        code: 'oas3-unused-components-schema',
        message: 'Potentially unused components schema has been detected.',
        path: ['components', 'schemas', 'Unhooked'],
        range: {
          end: {
            character: 11,
            line: 34,
          },
          start: {
            character: 22,
            line: 32,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});
