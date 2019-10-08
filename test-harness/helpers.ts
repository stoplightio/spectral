export function parseScenarioFile(data: string) {
  const regex = /====(test|document|command|status|stdout|stderr|env)====\r?\n/gi;
  const split = data.split(regex);

  const testIndex = split.findIndex(t => t === 'test');
  const documentIndex = split.findIndex(t => t === 'document');
  const commandIndex = split.findIndex(t => t === 'command');
  const statusIndex = split.findIndex(t => t === 'status');
  const stdoutIndex = split.findIndex(t => t === 'stdout');
  const stderrIndex = split.findIndex(t => t === 'stderr');
  const envIndex = split.findIndex(t => t === 'env');

  return {
    test: split[1 + testIndex],
    document: split[1 + documentIndex],
    command: split[1 + commandIndex],
    status: split[1 + statusIndex],
    stdout: split[1 + stdoutIndex],
    stderr: split[1 + stderrIndex],
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
