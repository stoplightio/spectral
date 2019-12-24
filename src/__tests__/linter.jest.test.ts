import { normalize } from '@stoplight/path';
import { DiagnosticSeverity } from '@stoplight/types';
import * as path from 'path';
import { httpAndFileResolver } from '../resolvers/http-and-file';
import { Spectral } from '../spectral';

const customFunctionOASRuleset = path.join(__dirname, './__fixtures__/custom-functions-oas-ruleset.json');
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
});
