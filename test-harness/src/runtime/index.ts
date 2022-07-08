declare module '@stoplight/spectral-test-harness' {
  export type SpawnFn = (
    command: string,
    env: Record<string, string>,
    cwd: string,
  ) => Promise<{
    stdout: string;
    stderr: string;
    status: number;
  }>;

  export const spawnNode: SpawnFn;
  export const applyReplacements: (str: string, values: Record<string, string>) => string;
  export const normalizeLineEndings: (input: string) => string;
}
