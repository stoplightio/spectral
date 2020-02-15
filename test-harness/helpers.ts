import { Dictionary, Optional } from '@stoplight/types';
import * as tmp from 'tmp';

export interface IScenarioFile {
  test: string;
  assets: string[][];
  command: string;
  status: Optional<string>;
  stdout: Optional<string>;
  stderr: Optional<string>;
  env: typeof process.env;
}

function getItem(input: string[], key: string, required: boolean): string;
function getItem(input: string[], key: string): Optional<string>;
function getItem(input: string[], key: string, required?: boolean): Optional<string> | string {
  const index = input.findIndex(t => t === key);
  if (index === -1 || index === input.length - 1) {
    if (required) {
      throw new TypeError(`Expected "${key}" to be provided`);
    }

    return;
  }

  return input[index + 1].trim();
}

export function parseScenarioFile(data: string): IScenarioFile {
  const regex = /====(test|document|command|status|stdout|stderr|env|asset:[a-z0-9.\-]+)====\r?\n/gi;
  const split = data.split(regex);

  const test = getItem(split, 'test', true);
  const document = getItem(split, 'document');
  const command = getItem(split, 'command', true);
  const status = getItem(split, 'status');
  const stdout = getItem(split, 'stdout');
  const stderr = getItem(split, 'stderr');
  const env = getItem(split, 'env');

  const assets = split.reduce<string[][]>((filtered, item, i) => {
    if (item.startsWith('asset')) {
      filtered.push([item, split[i + 1].trim()]);
    }

    return filtered;
  }, []);

  if (document !== void 0) {
    assets.push(['document', document]);
  }

  return {
    test,
    assets,
    command,
    status,
    stdout,
    stderr,
    env: env === void 0 ? process.env : getEnv(env),
  };
}

function getEnv(env: string): NodeJS.ProcessEnv {
  return env.split(/\r?\n/).reduce(
    (envs, line) => {
      const [key, value = ''] = line.split('=');
      envs[key] = value;
      return envs;
    },
    { ...process.env },
  );
}

export function tmpFile(opts?: tmp.TmpNameOptions): Promise<tmp.FileResult> {
  return new Promise((resolve, reject) => {
    tmp.file(
      {
        postfix: '.yml',
        prefix: 'asset-',
        tries: 10,
        ...opts,
      },
      (err, name, fd, removeCallback) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            name,
            fd,
            removeCallback,
          });
        }
      },
    );
  });
}

const BRACES = /{([^}]+)}/g;

export const applyReplacements = (str: string, values: Dictionary<string>) => {
  BRACES.lastIndex = 0;
  let result: RegExpExecArray | null;

  // tslint:disable-next-line:no-conditional-assignment
  while ((result = BRACES.exec(str))) {
    if (!(result[1] in values)) continue;
    const newValue = String(values[result[1]] || '');
    str = `${str.slice(0, result.index)}${newValue}${str.slice(BRACES.lastIndex)}`;
    BRACES.lastIndex = result.index + newValue.length;
  }

  return str;
};

export const normalizeLineEndings = (str: string): string => {
  return str.replace(/\r?\n/g, '\n');
};
