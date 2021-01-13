import { DiagnosticSeverity } from '@stoplight/types';
import { FetchMockSandbox } from 'fetch-mock';
import { Document } from '../../../document';
import type { Spectral } from '../../../spectral';
import * as Parsers from '../../../parsers';
import { createWithRules } from './__helpers__/createWithRules';
import { httpAndFileResolver } from '../../../resolvers/http-and-file';

describe('unusedDefinition - Http remote references', () => {
  let fetchMock: FetchMockSandbox;

  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['oas2-unused-definition'], { resolver: httpAndFileResolver });
    fetchMock = require('fetch-mock').default.sandbox();
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
