export const isNimmaEnvVariableSet = (): boolean => {
  const globalNimma = typeof global === 'object' && Boolean(global?.process?.env?.USE_NIMMA);

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const windowNimma = typeof window === 'object' && Boolean(window?.__env__?.USE_NIMMA);

  const isNimmaActivated = globalNimma || windowNimma;

  return Boolean(isNimmaActivated);
};
