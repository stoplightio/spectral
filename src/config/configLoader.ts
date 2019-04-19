import { existsSync, readFileSync, readJSONSync } from 'fs-extra';
import * as yaml from 'js-yaml';
import { merge } from 'lodash';
import * as path from 'path';
import { ConfigFormat, IConfig } from '../types/config';

const DEFAULT_CONFIG_FILE = 'spectral.yml';

const loadJsonFile = (filePath: string) => {
  if (existsSync(filePath)) {
    return readJSONSync(filePath);
  }
  throw new Error(`${filePath} does not exist`);
};

const loadYamlFile = (filePath: string) => {
  if (existsSync(filePath)) {
    return yaml.safeLoad(readFileSync(filePath, 'utf8')) || {};
  }
  throw new Error(`${filePath} does not exist`);
};

const loadConfig = (filePath: any): IConfig => {
  let config;

  switch (path.extname(filePath)) {
    case '.json':
      config = loadJsonFile(filePath);
      break;
    case '.yaml':
    case '.yml':
      config = loadYamlFile(filePath);
      break;
    default:
      throw new Error('Unknown file');
  }

  return config;
};

const extend = async (config: IConfig, filePath: string): Promise<IConfig> => {
  let configResult = Object.assign({}, config);
  const { extends: extendsValue } = config;
  if (extendsValue) {
    configResult = merge(await load(extendsValue, filePath), config);
  }
  delete configResult.extends;
  return configResult;
};

export const load = async (filePath: string, referencedPath: string = ''): Promise<IConfig> => {
  const resolvedPath: string = path.resolve(path.dirname(referencedPath), filePath);
  const config: IConfig = await loadConfig(resolvedPath);

  // validate

  if (config.extends) {
    return extend(config, resolvedPath);
  }

  return merge(createEmptyConfig(), config);
};

export const createEmptyConfig = (): IConfig => ({
  encoding: 'utf8',
  format: ConfigFormat.STYLISH,
  verbose: false,
});

export const getDefaultConfigFile = (directory: string) => {
  const filePath = path.join(directory, DEFAULT_CONFIG_FILE);
  return existsSync(filePath) ? filePath : null;
};
