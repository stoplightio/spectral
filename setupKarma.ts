import * as jsonSpecv4 from 'ajv/lib/refs/json-schema-draft-04.json';
import { FetchMockSandbox } from 'fetch-mock';

const oasRuleset = JSON.parse(JSON.stringify(require('./rulesets/oas/index.json')));
const oasFunctions = JSON.parse(JSON.stringify(require('./__karma__/__fixtures__/oas-functions.json')));
const oas2Schema = JSON.parse(JSON.stringify(require('./rulesets/oas/schemas/schema.oas2.json')));
const oas3Schema = JSON.parse(JSON.stringify(require('./rulesets/oas/schemas/schema.oas3.json')));

const { fetch } = window;
let fetchMock: FetchMockSandbox;

beforeEach(() => {
  fetchMock = require('fetch-mock').sandbox();
  fetchMock.catch((url, _opts) => {
    console.warn(`Url '${url}' hasn't been found. Have you forgotten to mock it in 'setupKarma.ts'?`);
    return 404;
  });

  window.fetch = fetchMock;

  fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/oas/index.json', {
    status: 200,
    body: JSON.parse(JSON.stringify(oasRuleset)),
  });

  fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/oas/schemas/schema.oas2.json', {
    status: 200,
    body: JSON.parse(JSON.stringify(oas2Schema)),
  });

  fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/oas/schemas/schema.oas3.json', {
    status: 200,
    body: JSON.parse(JSON.stringify(oas3Schema)),
  });

  [
    ['oas', oasFunctions],
  ].forEach(([rulesetName, funcs]) => {
    for (const [name, fn] of Object.entries<string>(funcs)) {
      fetchMock.get(`https://unpkg.com/@stoplight/spectral/rulesets/${rulesetName}/functions/${name}`, {
        status: 200,
        body: fn,
      });
    }
  });

  fetchMock.get('http://json-schema.org/draft-04/schema', {
    status: 200,
    body: JSON.parse(JSON.stringify(jsonSpecv4)),
  });
});

afterEach(() => {
  window.fetch = fetch;
});
