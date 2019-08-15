import { FetchMockSandbox } from 'fetch-mock';
import { readRulesFromRulesets } from '../reader';

const { fetch } = window;

const oasRuleset = require('../oas/index.json');
const oas2Ruleset = require('../oas2/index.json');
const oas2Schema = require('../oas2/schemas/main.json');
const oas3Ruleset = require('../oas3/index.json');
const oas3Schema = require('../oas3/schemas/main.json');

describe('Rulesets reader', () => {
  let fetchMock: FetchMockSandbox;

  beforeEach(() => {
    fetchMock = require('fetch-mock').sandbox();
    window.fetch = fetchMock;

    fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/oas/index.json', {
      status: 200,
      body: oasRuleset,
    });

    fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/oas2/index.json', {
      status: 200,
      body: oas2Ruleset,
    });

    fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/oas3/index.json', {
      status: 200,
      body: oas3Ruleset,
    });

    fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/oas2/schemas/main.json', {
      status: 200,
      body: oas2Schema,
    });

    fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/oas3/schemas/main.json', {
      status: 200,
      body: oas3Schema,
    });
  });

  afterEach(() => {
    window.fetch = fetch;
  });

  it('should resolve oas2-schema', async () => {
    const rules = await readRulesFromRulesets('spectral:oas2');
    expect(rules['oas2-schema']).not.toHaveProperty('then.functionOptions.schema.$ref');
    expect(rules['oas2-schema']).toHaveProperty(
      'then.functionOptions.schema',
      expect.objectContaining({
        title: 'A JSON Schema for Swagger 2.0 API.',
        id: 'http://swagger.io/v2/schema.json#',
        $schema: 'http://json-schema.org/draft-04/schema#',
      }),
    );
  });

  it('should resolve oas3-schema', async () => {
    const rules = await readRulesFromRulesets('spectral:oas3');
    expect(rules['oas3-schema']).not.toHaveProperty('then.functionOptions.schema.$ref');
    expect(rules['oas3-schema']).toHaveProperty(
      'then.functionOptions.schema',
      expect.objectContaining({
        id: 'https://spec.openapis.org/oas/3.0/schema/2019-04-02',
        $schema: 'http://json-schema.org/draft-04/schema#',
        description: 'Validation schema for OpenAPI Specification 3.0.X.',
      }),
    );
  });
});
