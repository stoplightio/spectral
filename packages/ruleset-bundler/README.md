# @stoplight/spectral-ruleset-bundler

## Options

- **plugins** - any other Rollup.js plugin, i.e. a minifier.
- **target**:
  - `node` - a preset suitable for the Node.js runtime
  - `browser` - a preset tailored to Browsers
  - `runtime` - a preset you want to use if you want to bundle & execute the ruleset at the runtime
- format - supported values are: `esm`, `commonjs`, `iife`.
- treeshake - whether to enable tree shaking. False by default.

**Bolded** options are required.

## Loading YAML/JSON Ruleset

```js
// spectral.mjs
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import { Spectral } from "@stoplight/spectral-core";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import { fetch } from "@stoplight/spectral-runtime";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const s = new Spectral();
s.setRuleset(await bundleAndLoadRuleset(path.join(__dirname, ".spectral.yaml"), { fs, fetch }));

// lint as usual
```
