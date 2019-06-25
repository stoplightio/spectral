---
title: Spectral Config
tags: 
- Documentation
- Config
---

Spectral CLI supports config files, to save you typing out CLI options and arguments every single time. 

By default Spectral CLI will look for `spectral.yml` in the current working directory, but it could be any JSON or YAML file if you specify it with the `--config` option. 

## Usage

```bash
spectral lint openapi.yaml --config=spectral.yaml
```

## Example Config

```yaml
lint:
  format: json
  ruleset: 
  - http://apis.example.com/governance/core.yml
  - http://apis.example.com/governance/rest.yml
  skipRule: 
  - that-one-rule
  - broken-rule
  output: tmp/lint-results.json
  verbose: true
```

Right now Spectral only has the one command: `lint`, but other commands in the
future will have their own config namespace too.

Here are all the available options, with their default values:

```yaml
lint:
  encoding: utf8   # text encoding to use
  format: stylish  # stylish, json
  output:          # filename for output instead of stdout
  maxResults:      # only show the first X erros
  verbose: false   # see more output for debugging
  ruleset:         # array of local files or URLs
  quiet: false     # see only results
  skipRule: []     # array of rule names as strings
```

The TypeScript interface here looks like this:

```typescript
export interface ILintConfig {
  encoding: string;
  format: ConfigFormat;
  maxResults?: number;
  output?: string;
  ruleset?: string[];
  skipRule?: string[];
  verbose: boolean;
}
```
