module.exports = (targetVal, _opts, paths) => {
  if (!targetVal) {
    return [
      {
        message: `${
          paths.target ? paths.target.join('.') : 'property'
        } is not truthy`,
      },
    ];
  }
};
