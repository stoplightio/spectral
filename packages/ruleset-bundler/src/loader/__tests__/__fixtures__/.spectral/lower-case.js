import lowerCase from 'https://esm.sh/lodash.lowercase';

export default input => {
  if (lowerCase(input) !== input) {
    return [{ message: 'must be lower case' }];
  }
};
