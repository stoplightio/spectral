# @stoplight/spectral-formatters

This project exposes the available formatters from the CLI for users that perform custom validation through Javascript.

## Usage

```ts
import { pretty } from "@stoplight/spectral-formatters";

const spectral = new Spectral();
// ...
const result = await spectral.run(document);

// You can also filter the results here.
const output = pretty(result);

console.error(output);
// ...
```

## Available formatters

### Common (available both in the browser and Node.js)

- json
- stylish
- junit
- html
- text
- teamcity
- markdown (example: [markdown_example.md](markdown_example.md))

### Node.js only

- pretty
- github-actions
- sarif
- gitlab
- code-climate
