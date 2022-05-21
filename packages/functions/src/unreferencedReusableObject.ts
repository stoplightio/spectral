import { createRulesetFunction } from '@stoplight/spectral-core';
import { safePointerToPath } from '@stoplight/spectral-runtime';

import { optionSchemas } from './optionSchemas';

export type Options = {
  reusableObjectsLocation: string;
};

export default createRulesetFunction<Record<string, unknown>, Options>(
  {
    input: {
      type: 'object',
    },
    options: optionSchemas.unreferencedReusableObject,
  },
  function unreferencedReusableObject(data, opts, { document, documentInventory }) {
    const graph = documentInventory.graph;
    if (graph === null) {
      throw new Error('unreferencedReusableObject requires dependency graph');
    }

    const normalizedSource = document.source ?? '';

    const defined = Object.keys(data).map(name => `${normalizedSource}${opts.reusableObjectsLocation}/${name}`);

    const orphans = defined.filter(defPath => !graph.hasNode(defPath));

    return orphans.map(orphanPath => {
      return {
        message: 'Potential orphaned reusable object has been detected',
        path: safePointerToPath(orphanPath),
      };
    });
  },
);
