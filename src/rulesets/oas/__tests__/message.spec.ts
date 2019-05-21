import { message } from '../../message';

describe('message util', () => {
  test('interpolates correctly', () => {
    const val = message`oops... ${'property'} missing;error: ${'error'}`;
    expect(
      val({
        property: 'description',
        error: 'expected property to be truthy',
      }),
    ).toEqual('oops... description missing;error: expected property to be truthy');
  });
});
