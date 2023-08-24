import { DiagnosticSeverity } from '@stoplight/types';
import { truthy } from '@stoplight/spectral-functions';
import * as Parsers from '@stoplight/spectral-parsers';
import { Resolver } from '@stoplight/spectral-ref-resolver';
import { Document } from '../document';
import { Spectral } from '../spectral';
import { Ruleset } from '../ruleset';

describe('spectral', () => {
  describe('when a $ref appears', () => {
    describe('and a custom resolver is provided', () => {
      test('will call the resolver with target', async () => {
        const customResolver = new Resolver();

        const resolve = jest.spyOn(customResolver, 'resolve');

        const s = new Spectral({
          resolver: customResolver,
        });

        const target = { foo: 'bar' };

        s.setRuleset(new Ruleset({ rules: {} }));
        await s.run(target);

        expect(resolve).toBeCalledWith(target, {
          authority: undefined,
          parseResolveResult: expect.any(Function),
        });
      });

      test('should recognize the source of local $refs', () => {
        const s = new Spectral();
        const source = 'foo.yaml';

        const document = new Document(
          JSON.stringify(
            {
              paths: {
                '/agreements': {
                  get: {
                    description: 'Get some Agreements',
                    responses: {
                      '200': {
                        $ref: '#/responses/GetAgreementsOk',
                      },
                      default: {},
                    },
                    summary: 'List agreements',
                    tags: ['agreements', 'pagination'],
                  },
                },
              },
              responses: {
                GetAgreementsOk: {
                  description: 'Successful operation',
                  headers: {},
                },
              },
            },
            null,
            2,
          ),
          Parsers.Json,
          source,
        );

        s.setRuleset({
          rules: {
            'pagination-responses-have-x-next-token': {
              description: 'All collection endpoints have the X-Next-Token parameter in responses',
              given: "$.paths..get.responses['200'].headers",
              severity: 'error',
              recommended: true,
              then: { field: 'X-Next-Token', function: truthy },
            },
          },
        });

        return expect(s.run(document)).resolves.toEqual([
          {
            code: 'pagination-responses-have-x-next-token',
            message: 'All collection endpoints have the X-Next-Token parameter in responses',
            path: ['responses', 'GetAgreementsOk', 'headers'],
            range: expect.any(Object),
            severity: DiagnosticSeverity.Error,
            source,
          },
        ]);
      });
    });
  });
});
