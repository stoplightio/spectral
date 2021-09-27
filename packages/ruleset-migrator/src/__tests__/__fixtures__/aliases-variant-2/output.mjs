import { oas2, oas3_0, oas3_1 } from '@stoplight/spectral-formats';
export default {
  aliases: {
    schema: {
      description: 'Foo',
      targets: [
        {
          formats: [oas2],
          given: '$.definitions[*]',
        },
        {
          formats: [oas3_0, oas3_1],
          given: '$.components.schemas[*]',
        },
      ],
    },
  },
};
