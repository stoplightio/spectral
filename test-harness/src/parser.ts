import { IS_WINDOWS } from './consts';

export interface IScenarioFile {
  id: string;
  path: string;
  test: string;
  assets: string[][];
  command: string | null;
  status: string | null;
  stdout: string | null;
  stderr: string | null;
  env: Record<string, string>;
}

export function parseScenarioFile(data: string): Omit<IScenarioFile, 'id' | 'path'> {
  const regex = /====(test|document|command(?:-(?:nix|win))?|status|stdout|stderr|env|asset:[a-z0-9./-]+)====\r?\n/gi;

  const split = data.split(regex);

  const test = getItem(split, 'test', true);
  const document = getItem(split, 'document');
  let command = getItem(split, 'command');
  const commandWindows = getItem(split, 'command-win');
  const commandUnix = getItem(split, 'command-nix');
  // ignoring Windows for the time being, as the spawned instance of powershell returns either 0 or 1
  const status = IS_WINDOWS ? null : getItem(split, 'status');
  const stdout = getItem(split, 'stdout');
  const stderr = getItem(split, 'stderr');
  const env = getItem(split, 'env');

  // either command only
  // or command-nix OR command-win OR (command-nix AND command-win)
  //
  // eg. command => Same script is run whatever the platform
  //     command-nix only => The test only works on Linux based systems
  //     command-nix & command-win => The test works on every platform, through different syntaxes
  if (command === null) {
    if (commandWindows === null && commandUnix === null) {
      throw new Error('No ====command[-nix|-win]==== provided');
    }
  } else if (commandWindows !== null || commandUnix !== null) {
    throw new Error('===command==== cannot be used along ====command-nix==== or ====command-win====');
  }

  if (IS_WINDOWS) {
    command = commandWindows ?? command;
  } else {
    command = commandUnix ?? command;
  }

  const assets = split.reduce<string[][]>((filtered, item, i) => {
    if (item.startsWith('asset')) {
      filtered.push([item, split[i + 1].trim()]);
    }

    return filtered;
  }, []);

  if (document !== null) {
    assets.push(['document', document]);
  }

  return {
    test,
    assets,
    command,
    status,
    stdout,
    stderr,
    env: env === null ? {} : getEnv(env),
  };
}

function getEnv(env: string): Record<string, string> {
  return env.split(/\r?\n/).reduce<Record<string, string>>((envs, line) => {
    const [key, value = ''] = line.split('=');
    envs[key] = value;
    return envs;
  }, {});
}

function getItem(input: string[], key: string, required: boolean): string;
function getItem(input: string[], key: string): string | null;
function getItem(input: string[], key: string, required?: boolean): string | null {
  const index = input.findIndex(t => t === key);
  if (index === -1 || index === input.length - 1) {
    if (required) {
      throw new TypeError(`Expected "${key}" to be provided`);
    }

    return null;
  }

  return input[index + 1].trim();
}
