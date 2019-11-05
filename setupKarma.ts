import * as jsonSpecv4 from 'ajv/lib/refs/json-schema-draft-04.json';
import { FetchMockSandbox } from 'fetch-mock';

const oasRuleset = JSON.parse(JSON.stringify(require('./rulesets/oas/index.json')));
const oas2Ruleset = JSON.parse(JSON.stringify(require('./rulesets/oas2/index.json')));
const oas2Schema = JSON.parse(JSON.stringify(require('./rulesets/oas2/schemas/main.json')));
const oas3Ruleset = JSON.parse(JSON.stringify(require('./rulesets/oas3/index.json')));
const oas3Schema = JSON.parse(JSON.stringify(require('./rulesets/oas3/schemas/main.json')));

const oasFunctions = {
  // import path used for require must be deterministic at build-time (not run-time) in case of Karma, hence no loop can be used
  '': JSON.parse(JSON.stringify(require('./__karma__/__fixtures__/oas-functions.json'))),
  '2': JSON.parse(JSON.stringify(require('./__karma__/__fixtures__/oas2-functions.json'))),
  '3': JSON.parse(JSON.stringify(require('./__karma__/__fixtures__/oas3-functions.json'))),
};

const { fetch } = window;
let fetchMock: FetchMockSandbox;

beforeEach(() => {
  fetchMock = require('fetch-mock').sandbox();
  window.fetch = fetchMock;

  fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/oas/index.json', {
    status: 200,
    body: JSON.parse(JSON.stringify(oasRuleset)),
  });

  fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/oas2/index.json', {
    status: 200,
    body: JSON.parse(JSON.stringify(oas2Ruleset)),
  });

  fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/oas3/index.json', {
    status: 200,
    body: JSON.parse(JSON.stringify(oas3Ruleset)),
  });

  fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/oas2/schemas/main.json', {
    status: 200,
    body: JSON.parse(JSON.stringify(oas2Schema)),
  });

  fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/oas3/schemas/main.json', {
    status: 200,
    body: JSON.parse(JSON.stringify(oas3Schema)),
  });

  for (const [spec, fns] of Object.entries(oasFunctions)) {
    for (const [name, fn] of Object.entries<string>(fns)) {
      fetchMock.get(`https://unpkg.com/@stoplight/spectral/rulesets/oas${spec}/functions/${name}`, {
        status: 200,
        body: fn,
      });
    }
  }

  fetchMock.get('http://json-schema.org/draft-04/schema', {
    status: 200,
    body: JSON.parse(JSON.stringify(jsonSpecv4)),
  });
});

afterEach(() => {
  window.fetch = fetch;
});
