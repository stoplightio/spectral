# @stoplight/spectral-ruleset-bundler

**WARNING** - for the time being, the following package is meant to be used internally.

## Options

- **plugins** - any other Rollup.js plugin, i.e. a minifier.
- **target**:
  - `node` - a preset suitable for the Node.js runtime
  - `browser` - a preset tailored to Browsers
  - `runtime` - a preset you want to use if you want to bundle & execute the ruleset at the runtime
- format - supported values are: `esm`, `commonjs`, `iife`.
- treeshake - whether to enable tree shaking. False by default.

**Bolded** options are required.
