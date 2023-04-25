import AggregateError = require('es-aggregate-error');

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toThrowAggregateError(error: AggregateError): R;
    }
  }
}

function toPlainObject(ex: unknown): Record<string, unknown> {
  if (ex instanceof Error) {
    return {
      ...ex,
      message: ex.message,
      name: ex.name,
    };
  }

  return Object(ex);
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

    expect(error).toEqual(expected);
    expect((error as AggregateError).errors).toEqual(expected.errors);
    expect((error as AggregateError).errors.map(toPlainObject)).toEqual(expected.errors.map(toPlainObject));

    return {
      message: (): string => 'All errors matched!',
      pass: true,
    };
  },
});
