function truthy(input) {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!input) {
    return [
      {
        message: '#{{print("property")}}must be truthy',
      },
    ];
  }

  return;
}

module.exports = {
  rules: {
    'defined-name': {
      given: '$..name',
      then: {
        function: truthy
      },
    },
  },
};
