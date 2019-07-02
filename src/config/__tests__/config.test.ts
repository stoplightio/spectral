import * as path from '@stoplight/path';
import { ConfigCommand } from '../../types/config';
import { load } from '../configLoader';

const getFixture = (filePath: string) => path.resolve(__dirname, './__fixtures__', filePath);

describe('config loading', () => {
  let exampleConfig: any;
  beforeEach(() => {
    exampleConfig = {
      lint: {
        encoding: 'utf8',
        format: 'json',
        verbose: true,
        maxResults: 5,
      },
    };
  });
  test('should load JSON config', async () => {
    const configPath = getFixture('config.json');
    const config = await load(configPath, ConfigCommand.LINT);
    expect(config).toEqual(exampleConfig);
  });

  test('should load YAML config', async () => {
    const configPath = getFixture('config.yaml');
    const config = await load(configPath, ConfigCommand.LINT);
    expect(config).toEqual(exampleConfig);
  });

  test('should load YML config', async () => {
    const configPath = getFixture('config.yml');
    const config = await load(configPath, ConfigCommand.LINT);
    expect(config).toEqual(exampleConfig);
  });

  test('should throw error if file does not exist', async () => {
    const configPath = getFixture('config.ghost.json');
    await expect(load(configPath, ConfigCommand.LINT)).rejects.toThrowError(/Could not parse/);
  });

  test('should throw error if JSON file is invalid', async () => {
    const configPath = getFixture('config.invalid.json');
    await expect(load(configPath, ConfigCommand.LINT)).rejects.toThrowError();
  });

  test('should throw error if YAML file is invalid', async () => {
    const configPath = getFixture('config.invalid.yaml');
    await expect(load(configPath, ConfigCommand.LINT)).rejects.toThrowError();
  });

  test('should load config with ruleset', async () => {
    const configPath = getFixture('./ruleset/config.ruleset.yml');
    const config = await load(configPath, ConfigCommand.LINT);
    expect(config.lint.ruleset).toEqual(['src/cli/commands/__tests__/__fixtures__/ruleset-invalid.yaml']);
  });

  test('should load config with string ruleset', async () => {
    const configPath = getFixture('./ruleset/config.ruleset.string.yml');
    const config = await load(configPath, ConfigCommand.LINT);
    expect(config.lint.ruleset).toEqual(['src/cli/commands/__tests__/__fixtures__/ruleset-invalid.yaml']);
  });

  test('should throw error if there is no lint specified', async () => {
    const configPath = getFixture('config.invalid.nolint.yaml');
    await expect(load(configPath, ConfigCommand.LINT)).rejects.toThrowError('Missing lint command in config file');
  });

  test('should throw error if config is empty', async () => {
    const configPath = getFixture('config.invalid.empty.yaml');
    await expect(load(configPath, ConfigCommand.LINT)).rejects.toThrowError('Missing config');
  });
});
