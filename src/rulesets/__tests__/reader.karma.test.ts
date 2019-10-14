import { FetchMockSandbox } from 'fetch-mock';
import { Spectral } from '../../spectral';
import { readRuleset } from '../reader';

describe('Rulesets reader', () => {
  let fetchMock: FetchMockSandbox;

  beforeEach(() => {
    fetchMock = require('fetch-mock').sandbox();
    window.fetch = fetchMock;
  });

  afterEach(() => {
    window.fetch = fetch;
  });

  it('is able to load the whole ruleset from static file', async () => {
    fetchMock.get('https://unpkg.com/@stoplight/spectral/rulesets/oas/index.json', {
      status: 404,
      body: {},
    });

    Spectral.registerStaticAssets(require('../../../rulesets/assets/assets.json'));

    const { rules, functions } = await readRuleset('spectral:oas');

    expect(rules).toMatchObject({
      'openapi-tags': expect.objectContaining({
        description: 'OpenAPI object should have non-empty `tags` array.',
        formats: ['oas2', 'oas3'],
      }),
      'oas2-schema': expect.objectContaining({
        description: 'Validate structure of OpenAPI v2 specification.',
        formats: ['oas2'],
      }),
      'oas3-schema': expect.objectContaining({
        description: 'Validate structure of OpenAPI v3 specification.',
        formats: ['oas3'],
      }),
    });

    expect(functions).toMatchObject({
      oasOp2xxResponse: expect.any(Object),
      oasOpFormDataConsumeCheck: expect.any(Object),
      oasOpIdUnique: expect.any(Object),
      oasOpParams: expect.any(Object),
      oasOpSecurityDefined: expect.any(Object),
      oasPathParam: expect.any(Object),
    });
  });
});
