export const isNimmaEnvVariableSet = (): boolean => {
  const globalNimma = typeof global === 'object' && Boolean(global?.process?.env?.USE_NIMMA);

  // @ts-expect-error: we have no types
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const windowNimma = typeof window === 'object' && Boolean(window?.__env__?.USE_NIMMA);

  const isNimmaActivated = globalNimma || windowNimma;

  return Boolean(isNimmaActivated);
};
