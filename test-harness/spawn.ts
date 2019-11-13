import { join } from '@stoplight/path';
import { Optional } from '@stoplight/types';
import * as child_process from 'child_process';
import { isString, pickBy } from 'lodash';
import * as pty from 'node-pty';
import * as os from 'os';
import { createStream, stringifyStream } from './helpers';

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
const cwd = join(__dirname, 'scenarios');

export type SpawnReturn = {
  stdout: string;
  stderr: string;
  status: number;
};

export type SpawnFn = (command: string, env: Optional<typeof process.env>) => Promise<SpawnReturn>;

export const spawnTTY: SpawnFn = (command, env) => {
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 160,
    rows: 100,
    cwd,
    env: pickBy(env, isString),
  });

  ptyProcess.write(command);
  ptyProcess.write('echo done');

  return new Promise<SpawnReturn>(resolve => {
    let stdout = '';
    ptyProcess.onExit(() => {
      const output = stdout
        .trim()
        .split(/\r?\n/)
        .slice(2);

      output.pop();

      resolve({
        status: 0,
        stderr: '',
        stdout: output.join('\n').trim(),
      });
    });

    ptyProcess.onData(data => {
      if (data.trim().endsWith('echo done')) {
        ptyProcess.kill('SIGTERM');
      } else {
        stdout += data;
      }
    });
  });
};

export const spawnNode: SpawnFn = async (command, env) => {
  const stderr = createStream();
  const stdout = createStream();

  const handle = child_process.spawn(command, {
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
    stderr: stderrText,
    stdout: stdoutText,
    status,
  };
};
