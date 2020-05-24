let seed = 0;

beforeEach(() => {
  seed = 0;
});

module.exports.nanoid = jest.fn(() => `random-id-${seed++}`);
