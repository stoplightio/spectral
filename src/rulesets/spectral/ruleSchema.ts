import { anEnum, array, object, optional, primitive } from './helpers';
import { ISchema } from './types';

export const ruleSchema: ISchema = {
  type: optional(anEnum(['validation', 'style'])),
  summary: optional(primitive('string')),
  description: optional(primitive('string')),
  severity: optional(anEnum([0, 1, 2, 3])),
  tags: optional(array(primitive('string'))),
  enabled: optional(primitive('boolean')),
  given: primitive('string'),
  when: optional(
    object({
      field: primitive('string'),
      pattern: optional(primitive('string')),
    })
  ),
  then: {
    type: 'or',
    types: [
      object({
        field: optional(primitive('string')),
        function: primitive('string'),
        functionOptions: optional(primitive('any')),
      }),
      array(
        object({
          field: optional(primitive('string')),
          function: primitive('string'),
          functionOptions: optional(primitive('any')),
        })
      ),
    ],
  },
};
