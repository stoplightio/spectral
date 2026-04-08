import lowerCase from 'https://cdn.jsdelivr.net/npm/lodash.lowercase/+esm';

export default input => {
  if (lowerCase(input) !== input) {
    return [{ message: 'must be lower case' }];
  }
};
