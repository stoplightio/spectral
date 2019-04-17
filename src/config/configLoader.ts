import { existsSync, readFileSync, readJSONSync } from 'fs-extra';
import * as yaml from 'js-yaml';
import { merge } from 'lodash';
import * as path from 'path';
import { ConfigFormat, IConfig } from './types';

const loadJsonFile = (filePath: string) => {
  try {
    if (existsSync(filePath)) {
      return readJSONSync(filePath);
    }
  } catch (e) {
    // console.error(`Cannot load  JSON file ${filePath}: ${e}`);
    throw e;
  }
  throw new Error(`${filePath} does not exist`);
};

const loadYamlFile = (filePath: string) => {
  try {
    if (existsSync(filePath)) {
      return yaml.safeLoad(readFileSync(filePath, 'utf8')) || {};
    }
  } catch (e) {
    // console.error(`Cannot load YAML file ${filePath}: ${e}`);
    throw e;
  }
  throw new Error(`${filePath} does not exist`);
};

const loadConfig = (filePath: any) => {
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

const createEmptyConfig = (): IConfig => {
  return {
    encoding: 'utf8',
    format: ConfigFormat.STYLISH,
    verbose: false,
  };
};

const extend = (config: IConfig, filePath: string): IConfig => {
  let configResult = Object.assign({}, config);
  const { extends: extendsValue } = config;
  if (extendsValue) {
    configResult = merge(load(extendsValue, filePath), config);
  }
  delete configResult.extends;
  return configResult;
};

export const load = (filePath: string, referencedPath: string): IConfig => {
  const resolvedPath: string = path.resolve(path.dirname(referencedPath), filePath);
  const config: IConfig = loadConfig(resolvedPath);
  // validate

  if (config.extends) {
    return extend(config, resolvedPath);
  }

  return merge(createEmptyConfig(), config);
};
