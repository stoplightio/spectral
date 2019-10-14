import { getLocationForJsonPath, parseWithPointers } from '@stoplight/json';
import * as path from '@stoplight/path';
import { unreferencedReusableObject } from '../../../functions/unreferencedReusableObject';
import { IParsedResult, RuleType, Spectral } from '../../../index';
import { httpAndFileResolver } from '../../../resolvers/http-and-file';
import { rules as oas3Rules } from '../../oas3/index.json';

import { DiagnosticSeverity } from '@stoplight/types';
import * as nock from 'nock';
import { readParsable } from '../../../fs/reader';

describe('unusedComponentsSchema - Http and fs remote references', () => {
  const s = new Spectral({ resolver: httpAndFileResolver });
  s.setFunctions({ unreferencedReusableObject });
  s.setRules({
    'unused-components-schema': Object.assign(oas3Rules['unused-components-schema'], {
      recommended: true,
      type: RuleType[oas3Rules['unused-components-schema'].type],
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
        '../../__tests__/__fixtures__/unusedComponentsSchema.definition.json#/components/schemas/ExternalFs',
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

      const results = await s.run({
        parsed: parseWithPointers(doc),
        getLocationForJsonPath,
      });

      expect(results).toEqual([
        {
          code: 'unused-components-schema',
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
      const fixturePath = path.join(__dirname, '../../__tests__/__fixtures__/unusedComponentsSchema.remoteLocal.json');

      const spec = parseWithPointers(await readParsable(fixturePath, { encoding: 'utf8' }));

      const parsedResult: IParsedResult = {
        source: fixturePath,
        parsed: spec,
        getLocationForJsonPath,
      };

      const results = await s.run(parsedResult, {
        resolve: {
          documentUri: fixturePath,
        },
      });

      expect(results).toEqual([]);
    });

    test('when analyzing an indirectly self-referencing document from the filesystem', async () => {
      const fixturePath = path.join(__dirname, '../../__tests__/__fixtures__/unusedComponentsSchema.indirect.1.json');

      const spec = parseWithPointers(await readParsable(fixturePath, { encoding: 'utf8' }));

      const parsedResult: IParsedResult = {
        source: fixturePath,
        parsed: spec,
        getLocationForJsonPath,
      };

      const results = await s.run(parsedResult, {
        resolve: {
          documentUri: fixturePath,
        },
      });

      expect(results).toEqual([
        {
          code: 'unused-components-schema',
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
          source: expect.stringMatching('/__tests__/__fixtures__/unusedComponentsSchema.indirect.1.json$'),
        },
      ]);
    });
  });
});
