import { Dictionary, Optional } from '@stoplight/types';
import * as tmp from 'tmp';

const IS_WINDOWS = process.platform === 'win32';

export interface IScenarioFile {
  test: string;
  assets: string[][];
  command: Optional<string>;
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
  const regex = /====(test|document|command(?:-(?:nix|win))?|status|stdout|stderr|env|asset:[a-z0-9.-]+)====\r?\n/gi;

  const split = data.split(regex);

  const test = getItem(split, 'test', true);
  const document = getItem(split, 'document');
  let command = getItem(split, 'command');
  const commandWindows = getItem(split, 'command-win');
  const commandUnix = getItem(split, 'command-nix');
  const status = getItem(split, 'status');
  const stdout = getItem(split, 'stdout');
  const stderr = getItem(split, 'stderr');
  const env = getItem(split, 'env');

  if (command === void 0) {
    if (commandWindows !== void 0 && commandUnix !== void 0) {
      throw new Error('No ====command==== provided');
    }

    command = IS_WINDOWS ? commandWindows : commandUnix;
  } else if (commandWindows !== void 0 || commandUnix !== void 0) {
    throw new Error('===command==== cannot be used along ====command-nix==== or ====command-win====');
  }

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

export const applyReplacements = (str: string, values: Dictionary<string>): string => {
  const replacer = (match: string, identifier: string): string => {
    if (!(identifier in values)) {
      return match;
    }

    return values[identifier];
  };

  return str.replace(BRACES, replacer);
};

export const normalizeLineEndings = (str: string): string => {
  return str.replace(/\r?\n/g, '\n');
};
