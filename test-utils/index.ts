type Body = string | Record<string, unknown>;

export declare function serveAssets(mocks: Record<string, Body>): void;
export declare function mockResponses(mocks: Record<string, Record<number, Body>>): void;
