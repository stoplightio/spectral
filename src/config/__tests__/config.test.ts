import * as path from 'path';
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
    const config = await load(configPath, '');
    expect(config).toEqual(exampleConfig);
  });

  test('should load YAML config', async () => {
    const configPath = getFixture('config.yaml');
    const config = await load(configPath, '');
    expect(config).toEqual(exampleConfig);
  });

  test('should load YML config', async () => {
    const configPath = getFixture('config.yml');
    const config = await load(configPath, '');
    expect(config).toEqual(exampleConfig);
  });

  test('should throw error if file does not exist', async () => {
    const configPath = getFixture('config.ghost.json');
    await expect(load(configPath, '')).rejects.toThrowError(/does not exist/);
  });

  test('should throw error if JSON file is invalid', async () => {
    const configPath = getFixture('config.invalid.json');
    await expect(load(configPath, '')).rejects.toThrowError();
  });

  test('should throw error if YAML file is invalid', async () => {
    const configPath = getFixture('config.invalid.yaml');
    await expect(load(configPath, '')).rejects.toThrowError();
  });

  test('should load config and apply extension', async () => {
    const configPath = getFixture('./extends/config.extended.yml');
    const config = await load(configPath, '');
    expect(config).toEqual({
      ...exampleConfig,
      lint: {
        ...exampleConfig.lint,
        maxResults: 6,
      },
    });
  });

  test('should apply relative extension', async () => {
    const configPath = getFixture('./extends/config.extended2.yml');
    const config = await load(configPath, '');
    expect(config).toEqual({
      ...exampleConfig,
      lint: {
        ...exampleConfig.lint,
        encoding: 'utf16',
        format: 'stylish',
      },
    });
  });
});
