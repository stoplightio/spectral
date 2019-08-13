module.exports = function () {
  return window.fetch.apply(window, arguments);
};
