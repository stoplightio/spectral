import { FetchMockSandbox } from 'fetch-mock';

const oasRuleset = JSON.parse(JSON.stringify(require('./rulesets/oas/index.json')));
const oas2Ruleset = JSON.parse(JSON.stringify(require('./rulesets/oas2/index.json')));
const oas2Schema = JSON.parse(JSON.stringify(require('./rulesets/oas2/schemas/main.json')));
const oas3Ruleset = JSON.parse(JSON.stringify(require('./rulesets/oas3/index.json')));
const oas3Schema = JSON.parse(JSON.stringify(require('./rulesets/oas3/schemas/main.json')));

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
});

afterEach(() => {
  window.fetch = fetch;
});
