import type { DeepPartial } from '@stoplight/types';
import type { RulesetFunctionContext } from '@stoplight/spectral-core';
import runtimeExpression from '../runtimeExpression';

function runRuntimeExpression(targetVal: unknown, context?: DeepPartial<RulesetFunctionContext>) {
  // @ts-expect-error: string is expected
  return runtimeExpression(targetVal, null, {
    path: ['paths', '/path', 'get', 'responses', '200', 'links', 'link', 'parameters', 'param'],
    documentInventory: {},
    ...context,
  } as RulesetFunctionContext);
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

  describe('invalid expressions, positive tests', () => {
    test.each(['$invalidkeyword'])('error for invalid base keyword', expr => {
      const results = runRuntimeExpression(expr);
      expect(results).toEqual([
        expect.objectContaining({
          message: 'Expressions must start with one of: `$url`, `$method`, `$statusCode`, `$request.`,`$response.`',
        }),
      ]);
    });

    test.each(['$request.invalidkeyword', '$response.invalidkeyword'])('second key invalid', expr => {
      const results = runRuntimeExpression(expr);
      expect(results).toEqual([
        expect.objectContaining({
          message: '`$request.` and `$response.` must be followed by one of: `header.`, `query.`, `body`, `body#`',
        }),
      ]);
    });

    test.each(['$request.body#.uses.dots.as.delimiters', '$response.body#.uses.dots.as.delimiters'])(
      'should error for using `.` as delimiter in json pointer',
      expr => {
        const results = runRuntimeExpression(expr);
        expect(results).toEqual([expect.objectContaining({ message: '`body#` must be followed by `/`' })]);
      },
    );

    test.each(['$request.body#/no/tilde/tokens/in/unescaped~', '$response.body#/invalid/escaped/~01'])(
      'errors for incorrect reference tokens',
      expr => {
        const results = runRuntimeExpression(expr);
        expect(results).toEqual([
          expect.objectContaining({
            message:
              'String following `body#` is not a valid JSON pointer, see https://spec.openapis.org/oas/v3.1.0#runtime-expressions for more information',
          }),
        ]);
      },
    );

    test.each(['$request.query.', '$response.query.'])('error for invalid name', expr => {
      const invalidString = String.fromCodePoint(0x80);
      const results = runRuntimeExpression(expr + invalidString);
      expect(results).toEqual([
        expect.objectContaining({
          message: 'String following `query.` and `path.` must only include ascii characters 0x01-0x7F.',
        }),
      ]);
    });

    test.each(['$request.header.', '$request.header.(invalid-parentheses)', '$response.header.no,commas'])(
      'error for invalid tokens',
      expr => {
        const results = runRuntimeExpression(expr);
        expect(results).toEqual([
          expect.objectContaining({ message: 'Must provide valid header name after `header.`' }),
        ]);
      },
    );
  });
});
