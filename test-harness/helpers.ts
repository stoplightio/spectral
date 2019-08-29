export function parseScenarioFile(data: string) {
  const regex = /====(test|document|command|stdout|stderr)====\r?\n/gi;
  const split = data.split(regex);

  const testIndex = split.findIndex(t => t === 'test');
  const documentIndex = split.findIndex(t => t === 'document');
  const commandIndex = split.findIndex(t => t === 'command');
  const stdoutIndex = split.findIndex(t => t === 'stdout');
  const stderrIndex = split.findIndex(t => t === 'stderr');

  return {
    test: split[1 + testIndex],
    document: split[1 + documentIndex],
    command: split[1 + commandIndex],
    stdout: split[1 + stdoutIndex],
    stderr: split[1 + stderrIndex],
  };
}
