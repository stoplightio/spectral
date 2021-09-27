declare module '@stoplight/spectral-test-utils' {
  type Body = string | Record<string, unknown>;

  export function serveAssets(mocks: Record<string, Body>): void;
  export function mockResponses(mocks: Record<string, Record<number, Body>>): void;
}
