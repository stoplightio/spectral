import { createRulesetFunction } from '@stoplight/spectral-core';
import { safePointerToPath } from '@stoplight/spectral-runtime';

export type Options = {
  reusableObjectsLocation: string;
};

export default createRulesetFunction<Record<string, unknown>, Options>(
  {
    input: {
      type: 'object',
    },
    options: {
      type: 'object',
      properties: {
        reusableObjectsLocation: {
          type: 'string',
          format: 'json-pointer-uri-fragment',
          errorMessage:
            '"unreferencedReusableObject" and its "reusableObjectsLocation" option support only valid JSON Pointer fragments, i.e. "#", "#/foo", "#/paths/~1user"',
        },
      },
      additionalProperties: false,
      required: ['reusableObjectsLocation'],
      errorMessage: {
        type:
          '"unreferencedReusableObject" function has invalid options specified. Example valid options: { "reusableObjectsLocation": "#/components/schemas" }, { "reusableObjectsLocation": "#/$defs" }',
        required:
          '"unreferencedReusableObject" function is missing "reusableObjectsLocation" option. Example valid options: { "reusableObjectsLocation": "#/components/schemas" }, { "reusableObjectsLocation": "#/$defs" }',
      },
    },
  },
  function unreferencedReusableObject(data, opts, _paths, otherValues) {
    const graph = otherValues.documentInventory.graph;
    if (graph === null) {
      throw new Error('unreferencedReusableObject requires dependency graph');
    }

    const normalizedSource = otherValues.documentInventory.source ?? '';

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
