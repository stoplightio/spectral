import { readRuleset } from '../reader';

describe('Rulesets reader', () => {
  it('should resolve oas3-schema', async () => {
    const { rules } = await readRuleset('spectral:oas');
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
