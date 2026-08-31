import * as fs from 'fs';
import { serveAssets } from '@stoplight/spectral-test-utils';
import * as runtime from '@stoplight/spectral-runtime';
import * as functions from '@stoplight/spectral-functions';

function parseBundle(code: string): { declarations: string[]; body: string } {
  const lines = code.split('\n');
  const declarations: string[] = [];
  const bodyLines: string[] = [];
  for (const line of lines) {
    if (/^const [\w$]+ = globalThis\[/.test(line)) {
      declarations.push(line);
    } else {
      bodyLines.push(line);
    }
  }
  return { declarations: declarations.sort(), body: bodyLines.join('\n') };
}

import { BundleOptions, bundleRuleset } from '../../index';
import type { IO } from '../../types';
import { virtualFs } from '../virtualFs';
import { builtins } from '../builtins';

describe('Builtins Plugin', () => {
  let io: IO;
  let randomSpy: jest.SpyInstance;

  beforeEach(() => {
    io = {
      fs,
      fetch: runtime.fetch,
    };

    randomSpy = jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.8229275205939697)
      .mockReturnValueOnce(0.7505242801973444)
      .mockReturnValueOnce(0.5647855410879519);
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  describe.each<BundleOptions['target']>(['browser', 'node', 'runtime'])('given %s target', target => {
    it('should inline Spectral packages & expose it to the runtime', async () => {
      serveAssets({
        '/tmp/input.js': `import { schema } from '@stoplight/spectral-functions';
import { oas } from '@stoplight/spectral-rulesets';

export default {
  extends: [oas],
  rules: {
    'my-rule': {
      given: '$',
      then: {
        function: schema,
        functionOptions: {
          schema: {
            type: 'object',
          },
        },
      },
    },
  },
};`,
      });

      const code = await bundleRuleset('/tmp/input.js', {
        format: 'esm',
        target,
        plugins: [builtins(), virtualFs(io)],
      });

      const { declarations, body } = parseBundle(code);
      expect(declarations).toEqual(
        [
          "const alphabetical = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-functions']['alphabetical'];",
          "const arazzo = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-rulesets']['arazzo'];",
          "const asyncapi = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-rulesets']['asyncapi'];",
          "const casing = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-functions']['casing'];",
          "const defined = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-functions']['defined'];",
          "const enumeration = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-functions']['enumeration'];",
          "const falsy = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-functions']['falsy'];",
          "const length = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-functions']['length'];",
          "const oas = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-rulesets']['oas'];",
          "const or = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-functions']['or'];",
          "const pattern = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-functions']['pattern'];",
          "const schema = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-functions']['schema'];",
          "const truthy = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-functions']['truthy'];",
          "const undefined$1 = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-functions']['undefined'];",
          "const unreferencedReusableObject = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-functions']['unreferencedReusableObject'];",
          "const xor = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-functions']['xor'];",
        ].sort(),
      );
      expect(body).toEqual(`

var input = {
  extends: [oas],
  rules: {
    'my-rule': {
      given: '$',
      then: {
        function: schema,
        functionOptions: {
          schema: {
            type: 'object',
          },
        },
      },
    },
  },
};

export { input as default };
`);

      expect(
        globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-functions'],
      ).toStrictEqual(functions);
    });

    it('should support overrides', async () => {
      serveAssets({
        '/tmp/input.js': `import { readFile } from '@stoplight/spectral-runtime';

readFile();`,
      });

      function readFile(): void {}

      const code = await bundleRuleset('/tmp/input.js', {
        format: 'esm',
        target,
        plugins: [
          builtins({
            '@stoplight/spectral-runtime': {
              readFile,
            },
          }),
          virtualFs(io),
        ],
      });

      const { declarations, body } = parseBundle(code);
      expect(declarations).toEqual(
        [
          "const DEFAULT_REQUEST_OPTIONS = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-runtime']['DEFAULT_REQUEST_OPTIONS'];",
          "const PrintStyle = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-runtime']['PrintStyle'];",
          "const decodeSegmentFragment = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-runtime']['decodeSegmentFragment'];",
          "const fetch = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-runtime']['fetch'];",
          "const getClosestJsonPath = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-runtime']['getClosestJsonPath'];",
          "const getEndRef = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-runtime']['getEndRef'];",
          "const isAbsoluteRef = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-runtime']['isAbsoluteRef'];",
          "const printError = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-runtime']['printError'];",
          "const printPath = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-runtime']['printPath'];",
          "const printValue = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-runtime']['printValue'];",
          "const readFile = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-runtime']['readFile'];",
          "const readParsable = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-runtime']['readParsable'];",
          "const safePointerToPath = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-runtime']['safePointerToPath'];",
          "const startsWithProtocol = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-runtime']['startsWithProtocol'];",
          "const traverseObjUntilRef = globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-runtime']['traverseObjUntilRef'];",
        ].sort(),
      );
      expect(body).toBe('\nreadFile();\n');

      expect(
        globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-runtime'],
      ).toStrictEqual({
        ...runtime,
        readFile,
      });
    });

    it('should isolate each instance', async () => {
      serveAssets({
        '/tmp/input.js': `import { readFile } from '@stoplight/spectral-runtime';

readFile();`,
      });

      function readFile(): void {}

      function readFile2(): void {}

      await bundleRuleset('/tmp/input.js', {
        format: 'esm',
        target,
        plugins: [
          builtins({
            '@stoplight/spectral-runtime': {
              readFile,
            },
          }),
          builtins({
            '@stoplight/spectral-runtime': {
              readFile: readFile2,
            },
          }),
          virtualFs(io),
        ],
      });

      expect(
        globalThis[Symbol.for('@stoplight-spectral/builtins')]['822928']['@stoplight/spectral-runtime'],
      ).toStrictEqual({
        ...runtime,
        readFile,
      });

      expect(
        globalThis[Symbol.for('@stoplight-spectral/builtins')]['750524']['@stoplight/spectral-runtime'],
      ).toStrictEqual({
        ...runtime,
        readFile: readFile2,
      });
    });
  });
});
