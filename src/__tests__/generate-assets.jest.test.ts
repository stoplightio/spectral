import { existsSync, readFileSync } from 'fs';

describe('generate-assets', () => {
  let assets: Record<string, string>;

  beforeAll(() => {
    const path = __dirname + '/../../rulesets/assets/assets.json';
    if (!existsSync(path)) {
      fail('Missing assets.json file. Please run `yarn generate-assets`.');
    }

    const content = readFileSync(path, { encoding: 'utf8' });
    assets = JSON.parse(content);
    expect(assets).not.toBeUndefined();
    expect(Object.keys(assets).length).toBeGreaterThan(1);
  });

  describe('produces properly serialized built-in rulesets', () => {
    const testCases = [
      ['oas', 'oas2-schema', 'title', 'A JSON Schema for Swagger 2.0 API.'],
      ['oas', 'oas3-schema', 'description', 'Validation schema for OpenAPI Specification 3.0.X.'],
      ['asyncapi', 'asyncapi-schema', 'title', 'AsyncAPI 2.0.0 schema.'],
    ];

    it.each(testCases)(
      "Ruleset '%s' contains a rule '%s' with an inlined schema bearing a '%s' property",
      (ruleset: string, ruleName: string, schemaKey: string, schemaValue: string) => {
        const key = `@stoplight/spectral/rulesets/${ruleset}/index.json`;
        expect(Object.keys(assets)).toContain(key);
        const content = JSON.parse(assets[key]);
        const rule = content.rules[ruleName];
        expect(rule).not.toBeUndefined();
        const schema = rule.then.functionOptions.schema;
        expect(schema[schemaKey]).not.toBeUndefined();
        expect(schema[schemaKey]).toEqual(schemaValue);
      },
    );
  });

  it('does not contain test files', () => {
    Object.keys(assets).forEach(key => {
      expect(key).not.toMatch('__tests__');
    });
  });
});
