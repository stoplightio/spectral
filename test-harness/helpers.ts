import { Dictionary, Optional } from '@stoplight/types';
import { Transform } from 'stream';
import * as tmp from 'tmp';

export interface IScenarioFile {
  test: string;
  // assets: Optional<string[][]>;
  document: Optional<string[][]>;
  command: string;
  status: Optional<string>;
  stdout: Optional<string>;
  stderr: Optional<string>;
  env: typeof process.env;
}

export function parseScenarioFile(data: string): IScenarioFile {
  const regex = /====(test|document|command|status|stdout|stderr|env)====\r?\n/gi;
  const split = data.split(regex);

  const testIndex = split.findIndex(t => t === 'test');
  const documentIndex = split.findIndex(t => t === 'document');
  // const assetsIndex = split.findIndex(t => t === 'assets');
  const commandIndex = split.findIndex(t => t === 'command');
  const statusIndex = split.findIndex(t => t === 'status');
  const stdoutIndex = split.findIndex(t => t === 'stdout');
  const stderrIndex = split.findIndex(t => t === 'stderr');
  const envIndex = split.findIndex(t => t === 'env');

  return {
    test: split[1 + testIndex],
    // assets: assetsIndex === -1 ? void 0 : assertArray(split[1 + assetsIndex]),
    document: documentIndex === -1 ? void 0 : [['document', split[1 + documentIndex]]],
    command: split[1 + commandIndex],
    status: statusIndex === -1 ? void 0 : String(split[1 + statusIndex]).trim(),
    stdout: stdoutIndex === -1 ? void 0 : split[1 + stdoutIndex],
    stderr: stderrIndex === -1 ? void 0 : split[1 + stderrIndex],
    env: envIndex === -1 ? process.env : getEnv(split[1 + envIndex]),
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

export const createStream = () =>
  new Transform({
    transform(chunk, encoding, done) {
      this.push(chunk);
      done();
    },
  });

export function stringifyStream(stream: Transform) {
  let result = '';

  stream.on('readable', () => {
    let chunk: string | null;

    // tslint:disable-next-line:no-conditional-assignment
    while ((chunk = stream.read()) !== null) {
      result += chunk;
    }
  });

  return new Promise<string>((resolve, reject) => {
    stream.on('error', reject);
    stream.on('end', () => {
      resolve(result);
    });
  });
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

export const assertArray = <T>(obj: unknown | T[]): T[] => {
  if (!Array.isArray(obj)) {
    throw new TypeError('Array expected');
  }

  return obj;
};

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
