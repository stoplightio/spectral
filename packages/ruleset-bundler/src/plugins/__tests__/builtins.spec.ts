import * as fs from 'fs';
import { serveAssets } from '@stoplight/spectral-test-utils';
import * as runtime from '@stoplight/spectral-runtime';
import * as functions from '@stoplight/spectral-functions';

jest.mock?.('fs');

import { BundleOptions, bundleRuleset } from '../../index';
import type { IO } from '../../types';
import { virtualFs } from '../virtualFs';
import { builtins } from '../builtins';

describe('Builtins Plugin', () => {
  let io: IO;

  beforeEach(() => {
    io = {
      fs,
      fetch: runtime.fetch,
    };
  });

  describe.each<BundleOptions['target']>(['browser', 'runtime'])('given %s target', target => {
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

      expect(code)
        .toEqual(`const alphabetical = globalThis[Symbol.for('@stoplight/spectral-functions')]['alphabetical'];
const casing = globalThis[Symbol.for('@stoplight/spectral-functions')]['casing'];
const defined = globalThis[Symbol.for('@stoplight/spectral-functions')]['defined'];
const enumeration = globalThis[Symbol.for('@stoplight/spectral-functions')]['enumeration'];
const falsy = globalThis[Symbol.for('@stoplight/spectral-functions')]['falsy'];
const length = globalThis[Symbol.for('@stoplight/spectral-functions')]['length'];
const pattern = globalThis[Symbol.for('@stoplight/spectral-functions')]['pattern'];
const schema = globalThis[Symbol.for('@stoplight/spectral-functions')]['schema'];
const truthy = globalThis[Symbol.for('@stoplight/spectral-functions')]['truthy'];
const undefined$1 = globalThis[Symbol.for('@stoplight/spectral-functions')]['undefined'];
const unreferencedReusableObject = globalThis[Symbol.for('@stoplight/spectral-functions')]['unreferencedReusableObject'];
const xor = globalThis[Symbol.for('@stoplight/spectral-functions')]['xor'];

const oas = globalThis[Symbol.for('@stoplight/spectral-rulesets')]['oas'];
const asyncapi = globalThis[Symbol.for('@stoplight/spectral-rulesets')]['asyncapi'];

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

      expect(globalThis[Symbol.for('@stoplight/spectral-functions')]).toStrictEqual(functions);
    });

    it('should support overrides', async () => {
      serveAssets({
        '/tmp/input.js': `import { readFile } from '@stoplight/spectral-runtime';

readFile();`,
      });

      // eslint-disable-next-line @typescript-eslint/no-empty-function
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

      expect(code).toEqual(`const fetch = globalThis[Symbol.for('@stoplight/spectral-runtime')]['fetch'];
const DEFAULT_REQUEST_OPTIONS = globalThis[Symbol.for('@stoplight/spectral-runtime')]['DEFAULT_REQUEST_OPTIONS'];
const decodeSegmentFragment = globalThis[Symbol.for('@stoplight/spectral-runtime')]['decodeSegmentFragment'];
const printError = globalThis[Symbol.for('@stoplight/spectral-runtime')]['printError'];
const PrintStyle = globalThis[Symbol.for('@stoplight/spectral-runtime')]['PrintStyle'];
const printPath = globalThis[Symbol.for('@stoplight/spectral-runtime')]['printPath'];
const printValue = globalThis[Symbol.for('@stoplight/spectral-runtime')]['printValue'];
const startsWithProtocol = globalThis[Symbol.for('@stoplight/spectral-runtime')]['startsWithProtocol'];
const isAbsoluteRef = globalThis[Symbol.for('@stoplight/spectral-runtime')]['isAbsoluteRef'];
const traverseObjUntilRef = globalThis[Symbol.for('@stoplight/spectral-runtime')]['traverseObjUntilRef'];
const getEndRef = globalThis[Symbol.for('@stoplight/spectral-runtime')]['getEndRef'];
const safePointerToPath = globalThis[Symbol.for('@stoplight/spectral-runtime')]['safePointerToPath'];
const getClosestJsonPath = globalThis[Symbol.for('@stoplight/spectral-runtime')]['getClosestJsonPath'];
const readFile = globalThis[Symbol.for('@stoplight/spectral-runtime')]['readFile'];
const readParsable = globalThis[Symbol.for('@stoplight/spectral-runtime')]['readParsable'];

readFile();
`);

      expect(globalThis[Symbol.for('@stoplight/spectral-runtime')]).toStrictEqual({
        ...runtime,
        readFile,
      });
    });
  });

  describe('given node target', () => {
    it('should be a no-op', async () => {
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
        target: 'node',
        plugins: [builtins(), virtualFs(io)],
      });

      expect(code).toEqual(`import { schema } from '@stoplight/spectral-functions';
import { oas } from '@stoplight/spectral-rulesets';

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

      expect(globalThis[Symbol.for('@stoplight/spectral-functions')]).toStrictEqual(functions);
    });
  });
});
