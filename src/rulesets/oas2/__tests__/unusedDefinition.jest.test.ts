import { getLocationForJsonPath, parseWithPointers } from '@stoplight/json';
import * as path from '@stoplight/path';
import { unreferencedReusableObject } from '../../../functions/unreferencedReusableObject';
import { IParsedResult, RuleType, Spectral } from '../../../index';
import { httpAndFileResolver } from '../../../resolvers/http-and-file';
import { rules as oas2Rules } from '../../oas2/index.json';

import { DiagnosticSeverity } from '@stoplight/types';
import * as nock from 'nock';
import { readParsable } from '../../../fs/reader';

describe('unusedDefinition - Http and fs remote references', () => {
  const s = new Spectral({ resolver: httpAndFileResolver });
  s.setFunctions({ unreferencedReusableObject });
  s.setRules({
    'unused-definition': Object.assign(oas2Rules['unused-definition'], {
      recommended: true,
      type: RuleType[oas2Rules['unused-definition'].type],
    }),
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
        '../../__tests__/__fixtures__/unusedDefinition.definition.json#/definitions/ExternalFs',
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
      const fixturePath = path.join(__dirname, '../../__tests__/__fixtures__/unusedDefinition.remoteLocal.json');

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
      const fixturePath = path.join(__dirname, '../../__tests__/__fixtures__/unusedDefinition.indirect.1.json');

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
          code: 'unused-definition',
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
          source: expect.stringMatching('/__tests__/__fixtures__/unusedDefinition.indirect.1.json$'),
        },
      ]);
    });
  });
});
