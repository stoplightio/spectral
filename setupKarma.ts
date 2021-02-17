// import * as jsonSpecv6 from 'ajv/lib/refs/json-schema-draft-0.json';
import { FetchMockSandbox } from 'fetch-mock';

import { isNimmaEnvVariableSet } from './src/utils/isNimmaEnvVariableSet';

const oasRuleset = JSON.parse(JSON.stringify(require('./rulesets/oas/index.json')));
const oasFunctions = JSON.parse(JSON.stringify(require('./__karma__/__fixtures__/oas-functions.json')));
const oas2Schema = JSON.parse(JSON.stringify(require('./rulesets/oas/schemas/oas2/schema.json')));
const oas30Schema = JSON.parse(JSON.stringify(require('./rulesets/oas/schemas/oas3_0/schema.json')));
const oas31Schema = JSON.parse(JSON.stringify(require('./rulesets/oas/schemas/oas3_1/schema.json')));
const asyncApiRuleset = JSON.parse(JSON.stringify(require('./rulesets/asyncapi/index.json')));
const asyncApiFunctions = JSON.parse(JSON.stringify(require('./__karma__/__fixtures__/asyncapi-functions.json')));
const asyncApi2Schema = JSON.parse(JSON.stringify(require('./rulesets/asyncapi/schemas/schema.asyncapi2.json')));

const { fetch } = window;
let fetchMock: FetchMockSandbox;

beforeEach(() => {
  fetchMock = require('fetch-mock').default.sandbox();
  fetchMock.catch((url, _opts) => {
    console.warn(`Url '${url}' hasn't been found. Have you forgotten to mock it in 'setupKarma.ts'?`);
    return 404;
  });

  window.fetch = fetchMock;

  fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/oas/index.json', {
    status: 200,
    body: JSON.parse(JSON.stringify(oasRuleset)),
  });

  fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/oas/schemas/oas2/schema.json', {
    status: 200,
    body: JSON.parse(JSON.stringify(oas2Schema)),
  });

  fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/oas/schemas/oas3_0/schema.json', {
    status: 200,
    body: JSON.parse(JSON.stringify(oas30Schema)),
  });

  fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/oas/schemas/oas3_1/schema.json', {
    status: 200,
    body: JSON.parse(JSON.stringify(oas31Schema)),
  });

  fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/asyncapi/index.json', {
    status: 200,
    body: JSON.parse(JSON.stringify(asyncApiRuleset)),
  });

  fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/asyncapi/schemas/schema.asyncapi2.json', {
    status: 200,
    body: JSON.parse(JSON.stringify(asyncApi2Schema)),
  });

  [
    ['oas', oasFunctions],
    ['asyncapi', asyncApiFunctions],
  ].forEach(([rulesetName, funcs]) => {
    for (const [name, fn] of Object.entries<string>(funcs)) {
      fetchMock.get(`https://unpkg.com/@stoplight/spectral/rulesets/${rulesetName}/functions/${name}`, {
        status: 200,
        body: fn,
      });
    }
  });

  // Can we avoid AJV hitting this URL all the time somehow? It shouldn't need to do that.
  // fetchMock.get('http://json-schema.org/draft-04/schema', {
  //   status: 200,
  //   body: JSON.parse(JSON.stringify(jsonSpecv4)),
  // });
});

afterEach(() => {
  window.fetch = fetch;
});

console.info(`Nimma rule optimizer activated: ${isNimmaEnvVariableSet()}`);
