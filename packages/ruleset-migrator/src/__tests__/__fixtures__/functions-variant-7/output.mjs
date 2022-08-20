export default {
  rules: {
    rule: {
      given: '$',
      then: {
        function: ReferenceError('Function "do-nothing" is not defined'),
      },
    },
  },
};
