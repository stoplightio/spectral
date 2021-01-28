import { DiagnosticSeverity } from '@stoplight/types';
import { FetchMockSandbox } from 'fetch-mock';
import { Document } from '../../../document';
import { Spectral } from '../../../index';
import * as Parsers from '../../../parsers';
import { createWithRules } from './__helpers__/createWithRules';
import { httpAndFileResolver } from '../../../resolvers/http-and-file';

describe('unusedComponent - Http remote references', () => {
  let fetchMock: FetchMockSandbox;
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['oas3-unused-component'], { resolver: httpAndFileResolver });
    fetchMock = require('fetch-mock').default.sandbox();
    window.fetch = fetchMock;
  });

  afterEach(() => {
    window.fetch = fetch;
  });

  test('reports unreferenced components', async () => {
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

    const results = await s.run(new Document(doc, Parsers.Json));

    expect(results).toEqual([
      {
        code: 'oas3-unused-component',
        message: 'Potentially unused component has been detected.',
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
