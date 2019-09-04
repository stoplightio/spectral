module.exports = (targetVal, opts) => {
  if (!(opts.property in targetVal)) {
    return [
      {
        message: `${opts.property} property is missing`,
      },
    ];
  }
};
