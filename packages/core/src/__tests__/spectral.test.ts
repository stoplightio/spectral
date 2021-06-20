import { IGraphNodeData } from '@stoplight/json-ref-resolver/types';
import { DiagnosticSeverity } from '@stoplight/types';
import { truthy } from '@stoplight/spectral-functions';
import { DepGraph } from 'dependency-graph';
import * as Parsers from '@stoplight/spectral-parsers';

import { Document } from '../document';
import { Spectral } from '../spectral';
import { IResolver } from '../types';

describe('spectral', () => {
  describe('when a $ref appears', () => {
    describe('and a custom resolver is provided', () => {
      test('will call the resolver with target', async () => {
        const customResolver: IResolver = {
          resolve: jest.fn(async () => ({
            result: {},
            refMap: {},
            graph: new DepGraph<IGraphNodeData>(),
            errors: [],
          })),
        };

        const s = new Spectral({
          resolver: customResolver,
        });

        const target = { foo: 'bar' };

        await s.run(target);

        expect(customResolver.resolve).toBeCalledWith(target, {
          authority: undefined,
          parseResolveResult: expect.any(Function),
        });
      });

      test('should handle lack of information about $refs gracefully', () => {
        const customResolver: IResolver = {
          resolve: jest.fn(async () => ({
            result: {
              foo: {
                bar: {
                  baz: '',
                },
              },
            },
            refMap: {},
            graph: new DepGraph<IGraphNodeData>(),
            errors: [],
          })),
        };

        const s = new Spectral({
          resolver: customResolver,
        });

        s.setRuleset({
          rules: {
            'truthy-baz': {
              given: '$.foo.bar.baz',
              message: 'Baz must be truthy',
              severity: DiagnosticSeverity.Error,
              recommended: true,
              then: {
                function: truthy,
              },
            },
          },
        });

        const target = new Document(`{"foo":"bar"}`, Parsers.Json, 'foo');

        return expect(s.run(target)).resolves.toStrictEqual([
          {
            code: 'truthy-baz',
            message: 'Baz must be truthy',
            path: ['foo', 'bar', 'baz'],
            range: {
              end: {
                character: 12,
                line: 0,
              },
              start: {
                character: 7,
                line: 0,
              },
            },
            severity: DiagnosticSeverity.Error,
            source: void 0,
          },
        ]);
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
