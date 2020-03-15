import { normalize } from '@stoplight/path';
import { DiagnosticSeverity } from '@stoplight/types';
import * as path from 'path';
import { isOpenApiv3 } from '../formats';
import { httpAndFileResolver } from '../resolvers/http-and-file';
import { Spectral } from '../spectral';

import { readRuleset } from '../rulesets';
import { IRuleset, RulesetExceptionCollection } from '../types/ruleset';

const customFunctionOASRuleset = path.join(__dirname, './__fixtures__/custom-functions-oas-ruleset.json');
const customOASRuleset = path.join(__dirname, './__fixtures__/custom-oas-ruleset.json');
const customDirectoryFunctionsRuleset = path.join(__dirname, './__fixtures__/custom-directory-function-ruleset.json');

describe('Linter', () => {
  let spectral: Spectral;

  beforeEach(() => {
    spectral = new Spectral();
  });

  it('should make use of custom functions', async () => {
    await spectral.loadRuleset(customFunctionOASRuleset);
    expect(await spectral.run({})).toEqual([
      expect.objectContaining({
        code: 'has-info-property',
        message: 'info property is missing',
      }),
    ]);
  });

  it('should prefer custom functions over the built-in ones', async () => {
    await spectral.loadRuleset(customFunctionOASRuleset);
    expect(
      await spectral.run({
        info: {
          contact: true,
        },
      }),
    ).toEqual([]);

    // this is an actual for difference between the built-in ruleset and the custon one

    expect(
      await spectral.run({
        info: {
          contact: 1,
        },
      }),
    ).toEqual([
      expect.objectContaining({
        code: 'true-info-contact',
      }),
    ]);
  });

  it('should not run function if provided data does not match defined schema', async () => {
    await spectral.loadRuleset(customFunctionOASRuleset);
    expect(await spectral.run({})).toEqual(
      expect.not.arrayContaining([
        // has-info-property-invalid is not executed
        expect.objectContaining({
          code: 'has-info-property-invalid',
        }),
      ]),
    );
  });

  it('should support require calls', async () => {
    await spectral.loadRuleset(customFunctionOASRuleset);
    expect(
      await spectral.run({
        info: {},
        paths: {},
      }),
    ).toEqual([
      expect.objectContaining({
        code: 'has-bar-get-operation',
        message: 'Object does not have undefined property',
        path: ['paths'],
      }),
    ]);
  });

  it('should respect the scope of defined functions (ruleset-based)', async () => {
    await spectral.loadRuleset(customDirectoryFunctionsRuleset);
    expect(await spectral.run({})).toEqual([
      expect.objectContaining({
        code: 'has-field-property',
        message: 'Object does not have field property',
      }),
      expect.objectContaining({
        code: 'has-info-property',
        message: 'info property is missing',
      }),
    ]);
  });

  it('should report resolving errors for correct files', async () => {
    spectral = new Spectral({ resolver: httpAndFileResolver });

    const documentUri = path.join(__dirname, './__fixtures__/schemas/doc.json');
    const result = await spectral.run(
      {
        $ref: './user.json',
      },
      {
        ignoreUnknownFormat: true,
        resolve: {
          documentUri,
        },
      },
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'invalid-ref',
          message: `ENOENT: no such file or directory, open '${path.join(documentUri, '../broken-age.yaml')}'`,
          path: ['age', '$ref'],
          source: normalize(path.join(documentUri, '../user.json')),
        }),
        expect.objectContaining({
          code: 'invalid-ref',
          message: `ENOENT: no such file or directory, open '${path.join(documentUri, '../broken-length.json')}'`,
          path: ['maxLength', '$ref'],
          source: normalize(path.join(documentUri, '../name.json')),
        }),
      ]),
    );
  });

  describe('evaluate "value" in validation messages', () => {
    test('should print correct values for referenced files', async () => {
      spectral = new Spectral({ resolver: httpAndFileResolver });

      spectral.setRules({
        'empty-is-falsy': {
          severity: DiagnosticSeverity.Error,
          recommended: true,
          description: 'Should be falsy',
          message: 'Value {{value|to-string}} should be falsy',
          given: '$..empty',
          then: {
            function: 'falsy',
          },
        },
      });

      return expect(
        spectral.run(
          {
            empty: {
              $ref: './__fixtures__/petstore.merge.keys.oas3.json#/info/contact/url',
            },
            bar: {
              empty: {
                $ref: './__fixtures__/petstore.oas3.json#/servers',
              },
            },
            foo: {
              empty: {
                $ref: './__fixtures__/petstore.oas3.json#/info',
              },
            },
          },
          {
            resolve: {
              documentUri: path.join(__dirname, 'foo.json'),
            },
          },
        ),
      ).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'empty-is-falsy',
            message: 'Value "https://example.com" should be falsy',
            path: ['info', 'contact', 'url'],
          }),
          expect.objectContaining({
            code: 'empty-is-falsy',
            message: 'Value Array[] should be falsy',
            path: ['servers'],
          }),
          expect.objectContaining({
            code: 'empty-is-falsy',
            message: 'Value Object{} should be falsy',
            path: ['info'],
          }),
        ]),
      );
    });
  });

  describe('Exceptions handling', () => {
    it('should ignore specified rules violations in a standalone document', async () => {
      await spectral.loadRuleset(customOASRuleset);
      spectral.registerFormat('oas3', isOpenApiv3);

      const res = await spectral.run(
        {
          openapi: '3.0.2',
          info: 17,
        },
        {
          resolve: {
            documentUri: '/test/file.json',
          },
        },
      );

      expect(res.length).toBeGreaterThan(0);

      expect(res).not.toContainEqual(
        expect.objectContaining({
          code: 'info-contact',
        }),
      );

      expect(res).not.toContainEqual(
        expect.objectContaining({
          code: 'info-description',
        }),
      );

      expect(res).not.toContainEqual(
        expect.objectContaining({
          code: 'oas3-api-servers',
        }),
      );
    });

    describe('resolving', () => {
      const document = {
        openapi: '3.0.2',
        components: {
          schemas: {
            TheLocalType: {
              $ref: './__fixtures__/exceptions.remote.oas3.yaml#/components/schemas/TheRemoteType',
            },
          },
        },
      };

      let testRuleset: IRuleset;

      beforeAll(async () => {
        testRuleset = await readRuleset(path.join(__dirname, './__fixtures__/exceptions.resolving.ruleset.json'));
      });

      const opts = {
        resolve: {
          documentUri: path.join(__dirname, './foo.json'),
        },
      };

      const extractExceptionFrom = (ruleset: IRuleset, name: string, position: number): RulesetExceptionCollection => {
        const exceptions = {};
        const key = Object.keys(ruleset.exceptions)[position];
        expect(ruleset.exceptions[key]).toEqual([name]);
        exceptions[key] = ruleset.exceptions[key];

        return exceptions;
      };

      it('should ignore specified rules violations in a referenced document', async () => {
        spectral = new Spectral({ resolver: httpAndFileResolver });
        spectral.registerFormat('oas3', isOpenApiv3);

        const rules = {
          'strings-maxLength': testRuleset.rules['strings-maxLength'],
          'oas3-schema': testRuleset.rules['oas3-schema'],
        };

        spectral.setRuleset({ rules, exceptions: {}, functions: {} });

        const first = await spectral.run(document, opts);

        expect(first).toEqual([
          expect.objectContaining({
            code: 'strings-maxLength',
          }),
          expect.objectContaining({
            code: 'oas3-schema',
          }),
        ]);

        const exceptions = extractExceptionFrom(testRuleset, 'strings-maxLength', 0);

        spectral.setRuleset({ rules, exceptions, functions: {} });

        const second = await spectral.run(document, opts);

        expect(second).toEqual([
          expect.objectContaining({
            code: 'oas3-schema',
          }),
        ]);
      });

      it('should ignore specified rules violations in "resolved=false" mode', async () => {
        spectral = new Spectral({ resolver: httpAndFileResolver });
        spectral.registerFormat('oas3', isOpenApiv3);

        const rules = {
          'no-yaml-remote-reference': testRuleset.rules['no-yaml-remote-reference'],
          'oas3-schema': testRuleset.rules['oas3-schema'],
        };

        spectral.setRuleset({ rules, exceptions: {}, functions: {} });

        const first = await spectral.run(document, opts);

        expect(first).toEqual([
          expect.objectContaining({
            code: 'oas3-schema',
          }),
          expect.objectContaining({
            code: 'no-yaml-remote-reference',
          }),
        ]);

        const exceptions = extractExceptionFrom(testRuleset, 'no-yaml-remote-reference', 1);

        spectral.setRuleset({ rules, exceptions, functions: {} });

        const second = await spectral.run(document, opts);

        expect(second).toEqual([
          expect.objectContaining({
            code: 'oas3-schema',
          }),
        ]);
      });
    });
  });
});
