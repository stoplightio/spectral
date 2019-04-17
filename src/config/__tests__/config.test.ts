import * as path from 'path';
import { load } from '../configLoader';

const getFixture = (filePath: string) => path.resolve(__dirname, './__fixtures__', filePath);

describe('config loading', () => {
  let exampleConfig: any;
  beforeEach(() => {
    exampleConfig = {
      encoding: 'utf8',
      format: 'json',
      verbose: true,
      maxResults: 5,
    };
  });
  test('should load JSON config', () => {
    const configPath = getFixture('config.json');
    const config = load(configPath, '');
    expect(config).toEqual(exampleConfig);
  });

  test('should load YAML config', () => {
    const configPath = getFixture('config.yaml');
    const config = load(configPath, '');
    expect(config).toEqual(exampleConfig);
  });

  test('should load YML config', () => {
    const configPath = getFixture('config.yml');
    const config = load(configPath, '');
    expect(config).toEqual(exampleConfig);
  });

  test('should throw error if file does not exist', () => {
    const configPath = getFixture('config.ghost.json');
    expect(() => {
      load(configPath, '');
    }).toThrowError(/does not exist/);
  });

  test('should throw error if JSON file is invalid', () => {
    const configPath = getFixture('config.invalid.json');
    expect(() => {
      load(configPath, '');
    }).toThrowError();
  });

  test('should throw error if YAML file is invalid', () => {
    const configPath = getFixture('config.invalid.yaml');
    expect(() => {
      load(configPath, '');
    }).toThrowError();
  });

  test('should load config and apply extension', () => {
    const configPath = getFixture('./extends/config.extended.yml');
    const config = load(configPath, '');
    expect(config).toEqual({
      ...exampleConfig,
      maxResults: 6,
    });
  });

  test('should apply relative extension', () => {
    const configPath = getFixture('./extends/config.extended2.yml');
    const config = load(configPath, '');
    expect(config).toEqual({
      ...exampleConfig,
      encoding: 'utf16',
      format: 'stylish',
    });
  });
});
