let seed = 0;

beforeEach(() => {
  seed = 0;
});

module.exports = jest.fn(() => `random-id-${seed++}`);
