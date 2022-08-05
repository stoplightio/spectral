import AggregateError = require('es-aggregate-error');

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toThrowAggregateError(error: AggregateError): R;
    }
  }
}

expect.extend({
  toThrowAggregateError(received, expected) {
    let error: unknown;
    if (typeof received === 'function') {
      expect(received).toThrow(AggregateError);
      try {
        received();
      } catch (e) {
        error = e;
      }
    } else {
      error = received;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as AggregateError).errors).toEqual(expected.errors);

    return {
      message: () => 'All errors matched!',
      pass: true,
    };
  },
});
