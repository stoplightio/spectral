module.exports = (targetVal, _opts, paths) => {
  if (targetVal !== true) {
    return [
      {
        message: `${paths.target ? paths.target.join('.') : 'property'} is not true`,
      },
    ];
  }
};
