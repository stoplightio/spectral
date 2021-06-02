import * as path from '@stoplight/path';
import { DiagnosticSeverity } from '@stoplight/types';
import * as nock from 'nock';

import { Document } from '../../../document';
import { readParsable } from '../../../fs/reader';
import type { Spectral } from '../../../spectral';
import * as Parsers from '../../../parsers';
import { createWithRules } from './__helpers__/createWithRules';
import { httpAndFileResolver } from '../../../resolvers/http-and-file';

describe('unusedDefinition - Http and fs remote references', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['oas2-unused-definition'], { resolver: httpAndFileResolver });
  });

  describe('reports unreferenced definitions', () => {
    test('when analyzing an in-memory document', async () => {
      nock('https://oas2.library.com')
        .get('/defs.json')
        .reply(
          200,
          JSON.stringify({
            definitions: {
              ExternalHttp: {
                type: 'number',
              },
            },
          }),
        );

      const remoteFsRefeferencePath = path.join(
        __dirname,
        './__fixtures__/unusedShared/unusedDefinition.definition.json#/definitions/ExternalFs',
      );

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
                "$ref": "${remoteFsRefeferencePath}"
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

      expect([...results]).toEqual([
        {
          code: 'oas2-unused-definition',
          message: 'Potentially unused definition has been detected.',
          path: ['definitions', 'Unhooked'],
          range: {
            end: {
              character: 9,
              line: 36,
            },
            start: {
              character: 20,
              line: 34,
            },
          },
          severity: DiagnosticSeverity.Warning,
        },
      ]);

      nock.cleanAll();
    });

    test('when analyzing a directly self-referencing document from the filesystem', async () => {
      const fixturePath = path.join(__dirname, './__fixtures__/unusedShared/unusedDefinition.remoteLocal.json');

      const doc = await readParsable(fixturePath, { encoding: 'utf8' });
      const results = await s.run(new Document(doc, Parsers.Json, fixturePath));

      expect([...results]).toEqual([]);
    });

    test('when analyzing an indirectly self-referencing document from the filesystem', async () => {
      const fixturePath = path.join(__dirname, './__fixtures__/unusedShared/unusedDefinition.indirect.1.json');

      const doc = await readParsable(fixturePath, { encoding: 'utf8' });
      const results = await s.run(new Document(doc, Parsers.Json, fixturePath));

      expect([...results]).toEqual([
        {
          code: 'oas2-unused-definition',
          message: 'Potentially unused definition has been detected.',
          path: ['definitions', 'Unhooked'],
          range: {
            end: {
              character: 5,
              line: 11,
            },
            start: {
              character: 16,
              line: 9,
            },
          },
          severity: DiagnosticSeverity.Warning,
          source: expect.stringMatching('/__fixtures__/unusedShared/unusedDefinition.indirect.1.json$'),
        },
      ]);
    });
  });
});
