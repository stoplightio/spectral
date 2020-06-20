import { DiagnosticSeverity } from '@stoplight/types';
import { FetchMockSandbox } from 'fetch-mock';
import { Document } from '../../../document';
import { unreferencedReusableObject } from '../../../functions/unreferencedReusableObject';
import { RuleType, Spectral } from '../../../index';
import * as Parsers from '../../../parsers';
import { createHttpAndFileResolver } from '../../../resolvers/http-and-file';
import { rules } from '../index.json';

describe('unusedDefinition - Http remote references', () => {
  let fetchMock: FetchMockSandbox;

  const s = new Spectral({ resolver: createHttpAndFileResolver() });
  s.registerFormat('oas2', () => true);
  s.setFunctions({ unreferencedReusableObject });
  s.setRules({
    'oas2-unused-definition': Object.assign(rules['oas2-unused-definition'], {
      recommended: true,
      type: RuleType[rules['oas2-unused-definition'].type],
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

    const results = await s.run(new Document(doc, Parsers.Json));

    expect(results).toEqual([
      {
        code: 'oas2-unused-definition',
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
