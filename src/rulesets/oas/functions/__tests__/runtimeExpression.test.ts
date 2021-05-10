import { DiagnosticSeverity } from '@stoplight/types';
import { functions } from '../../../../functions';
import { runtimeExpression } from '../runtimeExpression';
import { DocumentInventory } from '../../../../documentInventory';
import { Document } from '../../../../document';
import * as Parsers from '../../../../parsers';
import { isOpenApiv3, RuleType, Spectral } from '../../../..';
import { rules } from '../../index.json';

function runRuntimeExpression(targetVal: any) {
  const doc = new Document(JSON.stringify(targetVal), Parsers.Json);

  return runtimeExpression.call(
    { functions },
    targetVal,
    null,
    { given: ['paths', '/path', 'get', 'responses', '200', 'links', 'link', 'parameters', 'param'] },
    { given: null, original: null, documentInventory: new DocumentInventory(doc, {} as any), rule: {} as any }, // TODO
  );
}

describe('runtimeExpression', () => {
  describe('valid expressions, negative tests', () => {
    test.each(['$url', '$method', '$statusCode'])('no messages for valid expressions', expr => {
      expect(runRuntimeExpression(expr)).toBeUndefined();
    });

    test.each([{ obj: 'object' }, ['1'], 1])('no messages for non-strings', expr => {
      expect(runRuntimeExpression(expr)).toBeUndefined();
    });

    test.each(['$request.body', '$response.body'])('no messages for valid expressions', expr => {
      expect(runRuntimeExpression(expr)).toBeUndefined();
    });

    test.each(['$request.body#/chars/in/range/0x00-0x2E/0x30-0x7D/0x7F-0x10FFFF', '$response.body#/simple/path'])(
      'no messages for valid expressions',
      expr => {
        expect(runRuntimeExpression(expr)).toBeUndefined();
      },
    );

    test.each(['$request.body#/~0', '$response.body#/~1'])('no messages for valid expressions', expr => {
      expect(runRuntimeExpression(expr)).toBeUndefined();
    });

    test.each([
      '$request.query.query-name',
      '$response.query.QUERY-NAME',
      '$request.path.path-name',
      '$response.path.PATH-NAME',
    ])('no messages for valid expressions', expr => {
      expect(runRuntimeExpression(expr)).toBeUndefined();
    });

    test.each(["$request.header.a-zA-Z0-9!#$%&'*+-.^_`|~"])('no messages for valid expressions', expr => {
      expect(runRuntimeExpression(expr)).toBeUndefined();
    });
  });

  describe('invalid expressions, postive tests', () => {
    test.each(['$invalidkeyword'])('error for invalid base keyword', expr => {
      const results = runRuntimeExpression(expr);
      expect(results['length']).toBe(1);
      expect(results[0].message).toEqual(
        'expressions must start with one of: `$url`, `$method`, `$statusCode`, `$request.`,`$response.`',
      );
    });

    test.each(['$request.invalidkeyword', '$response.invalidkeyword'])('second key invalid', expr => {
      const results = runRuntimeExpression(expr);
      expect(results['length']).toBe(1);
      expect(results[0].message).toEqual(
        '`$request.` and `$response.` must be followed by one of: `header.`, `query.`, `body`, `body#`',
      );
    });

    test.each(['$request.body#.uses.dots.as.delimiters', '$response.body#.uses.dots.as.delimiters'])(
      'should error for using `.` as delimiter in json pointer',
      expr => {
        const results = runRuntimeExpression(expr);
        expect(results['length']).toBe(1);
        expect(results[0].message).toEqual('`body#` must be followed by `/`');
      },
    );

    test.each(['$request.body#/no/tilde/tokens/in/unescaped~', '$response.body#/invalid/escaped/~01'])(
      'errors for incorrect reference tokens',
      expr => {
        const results = runRuntimeExpression(expr);
        expect(results['length']).toBe(1);
        expect(results[0].message).toEqual(
          'string following `body#` is not a valid JSON pointer, see https://spec.openapis.org/oas/v3.1.0#runtime-expressions for more information',
        );
      },
    );

    test.each(['$request.query.', '$response.query.'])('error for invalid name', expr => {
      const invalidString = String.fromCodePoint(0x80);
      const results = runRuntimeExpression(expr + invalidString);
      expect(results['length']).toBe(1);
      expect(results[0].message).toEqual(
        'string following `query.` and `path.` must only include ascii characters 0x01-0x7F.',
      );
    });

    test.each(['$request.header.', '$request.header.(invalid-parentheses)', '$response.header.no,commas'])(
      'error for invalid tokens',
      expr => {
        const results = runRuntimeExpression(expr);
        expect(results).toBeDefined();
        expect(results['length']).toBe(1);
        expect(results[0].message).toEqual('must provide valid header name after `header.`');
      },
    );
  });
});

describe('runtimeExpression acceptance test', () => {
  test('all link objects are validated and correct error object produced', async () => {
    const s: Spectral = new Spectral();

    s.registerFormat('oas3', isOpenApiv3);
    s.setRules({
      'links-parameters-expression': {
        ...rules['links-parameters-expression'],
        type: RuleType[rules['links-parameters-expression'].type],
        then: {
          ...rules['links-parameters-expression'].then,
        },
      },
    });

    expect(
      await s.run({
        openapi: '3.0.1',
        info: {
          title: 'response example',
          version: '1.0',
        },
        paths: {
          '/user': {
            get: {
              responses: {
                200: {
                  description: 'dummy description',
                  links: {
                    link1: {
                      parameters: '$invalidkeyword',
                    },
                    link2: {
                      parameters: '$invalidkeyword',
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ).toEqual([
      {
        code: 'links-parameters-expression',
        message: 'expressions must start with one of: `$url`, `$method`, `$statusCode`, `$request.`,`$response.`',
        path: ['paths', '/user', 'get', 'responses', 'linkName', 'link1', 'parameters'],
        severity: DiagnosticSeverity.Error,
        range: expect.any(Object),
      },
      {
        code: 'links-parameters-expression',
        message: 'expressions must start with one of: `$url`, `$method`, `$statusCode`, `$request.`,`$response.`',
        path: ['paths', '/user', 'get', 'responses', 'linkName', 'link2', 'parameters'],
        severity: DiagnosticSeverity.Error,
        range: expect.any(Object),
      },
    ]);
  });
});
