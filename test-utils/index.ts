declare module '@stoplight/spectral-test-utils' {
  export function serveAssets(mocks: Record<string, string | Record<string, unknown>>): void;
}
