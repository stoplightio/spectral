import lowerCase from 'https://cdn.skypack.dev/lodash.lowercase';

export default input => {
  if (lowerCase(input) !== input) {
    return [{ message: 'must be lower case' }];
  }
};
