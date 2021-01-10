import * as path from '@stoplight/path';
import { DiagnosticSeverity } from '@stoplight/types';
import * as nock from 'nock';

import { Document } from '../../../document';
import { readParsable } from '../../../fs/reader';
import { unreferencedReusableObject } from '../../../functions/unreferencedReusableObject';
import { RuleType, Spectral } from '../../../index';
import * as Parsers from '../../../parsers';
import { httpAndFileResolver } from '../../../resolvers/http-and-file';
import { rules } from '../index.json';

describe('unusedComponentsSchema - Http and fs remote references', () => {
  const s = new Spectral({ resolver: httpAndFileResolver });
  s.registerFormat('oas3', () => true);
  s.setFunctions({ unreferencedReusableObject });
  s.setRules({
    'oas3-unused-components-schema': Object.assign(rules['oas3-unused-components-schema'], {
      recommended: true,
      type: RuleType[rules['oas3-unused-components-schema'].type],
    }),
  });

  describe('reports unreferenced components schemas', () => {
    test('when analyzing an in-memory document', async () => {
      nock('https://oas3.library.com')
        .get('/defs.json')
        .reply(
          200,
          JSON.stringify({
            components: {
              schemas: {
                ExternalHttp: {
                  type: 'number',
                },
              },
            },
          }),
        );

      const remoteFsRefeferencePath = path.join(
        __dirname,
        './__fixtures__/unusedShared/unusedComponentsSchema.definition.json#/components/schemas/ExternalFs',
      );

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
                "$ref": "${remoteFsRefeferencePath}"
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
          code: 'oas3-unused-components-schema',
          message: 'Potentially unused components schema has been detected.',
          path: ['components', 'schemas', 'Unhooked'],
          range: {
            end: {
              character: 11,
              line: 37,
            },
            start: {
              character: 22,
              line: 35,
            },
          },
          severity: DiagnosticSeverity.Warning,
        },
      ]);

      nock.cleanAll();
    });

    test('when analyzing a directly self-referencing document from the filesystem', async () => {
      const fixturePath = path.join(__dirname, './__fixtures__/unusedShared/unusedComponentsSchema.remoteLocal.json');

      const spec = await readParsable(fixturePath, { encoding: 'utf8' });
      const results = await s.run(new Document(spec, Parsers.Json, fixturePath));

      expect(results).toEqual([]);
    });

    test('when analyzing an indirectly self-referencing document from the filesystem', async () => {
      const fixturePath = path.join(__dirname, './__fixtures__/unusedShared/unusedComponentsSchema.indirect.1.json');

      const spec = await readParsable(fixturePath, { encoding: 'utf8' });
      const results = await s.run(new Document(spec, Parsers.Json, fixturePath));

      expect(results).toEqual([
        {
          code: 'oas3-unused-components-schema',
          message: 'Potentially unused components schema has been detected.',
          path: ['components', 'schemas', 'Unhooked'],
          range: {
            end: {
              character: 7,
              line: 12,
            },
            start: {
              character: 18,
              line: 10,
            },
          },
          severity: DiagnosticSeverity.Warning,
          source: expect.stringMatching('/__fixtures__/unusedShared/unusedComponentsSchema.indirect.1.json$'),
        },
      ]);
    });
  });
});
