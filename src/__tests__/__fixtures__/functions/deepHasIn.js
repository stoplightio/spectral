const { hasIn } = require('lodash');

module.exports = (targetVal, opts) => {
  if (!(hasIn(targetVal, opts.path))) {
    return [
      {
        message: `Object does not have ${opts.prop} property`,
      },
    ];
  }
};
