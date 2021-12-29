import * as validate from 'validate-npm-package-name';

const isValidPackageName = (packageName: string): boolean => validate(packageName).validForNewPackages;

export const isPackageImport = (packageName: string): boolean => {
  const fragments = packageName.split('/');
  if (packageName.startsWith('@') && fragments.length >= 2) {
    fragments.splice(0, 2, `${fragments[0]}/${fragments[1]}`);
  }

  return fragments.every(isValidPackageName);
};
