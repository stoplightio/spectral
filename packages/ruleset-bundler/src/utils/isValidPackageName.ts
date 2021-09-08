import * as validate from 'validate-npm-package-name';

export const isValidPackageName = (packageName: string): boolean => validate(packageName).validForNewPackages;
