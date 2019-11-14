import { join } from '@stoplight/path';
import { Optional } from '@stoplight/types';
import * as child_process from 'child_process';
import { createStream, stringifyStream } from './helpers';

const cwd = join(__dirname, 'scenarios');

export type SpawnReturn = {
  stdout: string;
  stderr: string;
  status: number;
};

export type SpawnFn = (command: string, env: Optional<typeof process.env>) => Promise<SpawnReturn>;

export const spawnNode: SpawnFn = async (script, env) => {
  const stderr = createStream();
  const stdout = createStream();

  const handle = child_process.spawn(script, [], {
    shell: true,
    windowsVerbatimArguments: false,
    env,
    cwd,
    stdio: 'pipe',
  });

  handle.stderr.pipe(stderr);
  handle.stdout.pipe(stdout);

  const stderrText = (await stringifyStream(stderr)).trim();
  const stdoutText = (await stringifyStream(stdout)).trim();

  const status = await new Promise<number>(resolve => {
    handle.on('close', resolve);
  });

  return {
    stderr: stderrText.replace(/\r?\n/g, '\n'),
    stdout: stdoutText.replace(/\r?\n/g, '\n'),
    status,
  };
};
