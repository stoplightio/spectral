module.exports = (targetVal, opts) => {
  if (!(opts.prop in targetVal)) {
    return [
      {
        message: `Object does not have ${opts.prop} property`,
      },
    ];
  }
};
