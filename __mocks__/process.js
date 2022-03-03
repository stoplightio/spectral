module.exports.exit = jest.fn();
module.exports.cwd = jest.fn();
module.exports.on = jest.fn();

module.exports.stdin = {
  fd: 0,
  isTTY: true,
};
module.exports.stdout = {
  write: jest.fn(),
};

module.exports.stderr = {
  write: jest.fn(),
};
