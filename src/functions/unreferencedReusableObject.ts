import { isObject } from 'lodash';
import { IFunction } from '../types';
import { safePointerToPath } from '../utils';

export const unreferencedReusableObject: IFunction<{
  reusableObjectsLocation: string;
}> = (data, opts, _paths, otherValues) => {
  if (!isObject(data)) return [];

  if (!opts.reusableObjectsLocation.startsWith('#')) {
    throw new Error(
      "Function option 'reusableObjectsLocation' doesn't look like containing a valid local json pointer.",
    );
  }

  const normalizedSource = otherValues.documentInventory.source ?? '';

  const defined = Object.keys(data).map(name => `${normalizedSource}${opts.reusableObjectsLocation}/${name}`);

  const orphans = defined.filter(defPath => !otherValues.documentInventory.graph.hasNode(defPath));

  return orphans.map(orphanPath => {
    return {
      message: 'Potential orphaned reusable object has been detected.',
      path: safePointerToPath(orphanPath),
    };
  });
};
