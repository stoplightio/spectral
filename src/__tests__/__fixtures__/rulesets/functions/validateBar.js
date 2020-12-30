module.exports = function (targetVal, opts, paths, otherValues) {
  return 'bar' in targetVal
    ? this.functions.schema(targetVal.bar, opts, paths, otherValues)
    : void 0;
};
