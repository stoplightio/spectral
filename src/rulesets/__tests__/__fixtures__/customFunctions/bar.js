module.exports = (targetVal, _opts, paths) => {
  if (targetVal !== 'bar') {
    return [
      {
        message: `${paths.target ? paths.target.join('.') : 'property'} does not equals "bar".`,
      },
    ];
  }
};
