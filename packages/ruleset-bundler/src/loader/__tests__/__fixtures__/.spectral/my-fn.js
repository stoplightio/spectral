import { isOdd } from './helpers/index.js';

export default input => {
  if (!isOdd(input)) {
    return [{ message: 'must be odd' }];
  }
};
