import { NPM_PKG_ROOT, SPECTRAL_PKG_NAME } from '../../consts';

export function isNPMSource(src: string): boolean {
  return src.startsWith(NPM_PKG_ROOT) && !src.includes(`${NPM_PKG_ROOT}${SPECTRAL_PKG_NAME}`); // we ignore spectral on purpose, since they undergo a slightly different process
}
