import { isObject } from 'lodash';
import { IFunction } from '../types';
import { safePointerToPath } from '../utils';

export const unreferencedReusableObject: IFunction<{ reusableObjectsLocation: string }> = (
  data,
  opts,
  _paths,
  otherValues,
) => {
  if (!isObject(data)) return;

  const graph = otherValues.documentInventory.graph;
  if (graph === null) {
    return [{ message: 'unreferencedReusableObject requires dependency graph' }];
  }

  const normalizedSource = otherValues.documentInventory.source ?? '';

  const defined = Object.keys(data).map(name => `${normalizedSource}${opts.reusableObjectsLocation}/${name}`);

  const orphans = defined.filter(defPath => !graph.hasNode(defPath));

  return orphans.map(orphanPath => {
    return {
      message: 'Potential orphaned reusable object has been detected.',
      path: safePointerToPath(orphanPath),
    };
  });
};
