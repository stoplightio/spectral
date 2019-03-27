import { resolve } from "path";

import { oas2Functions, oas2Rules } from "../rulesets/oas2";
import { oas3Functions, oas3Rules } from "../rulesets/oas3";
import { Spectral } from "../spectral";

describe("linter", () => {
  const spectral = new Spectral();

  describe("OpenAPI 2.0", () => {
    spectral.addFunctions(oas2Functions());
    spectral.addRules(oas2Rules());

    test("returns a few validations given wishlist", async () => {
      const specPath = resolve(__dirname, "__fixtures__/wishlist.yaml");
      const results = await spectral.run(specPath);
      expect(results).toMatchInlineSnapshot(`
Array [
  Object {
    "code": "info-contact",
    "message": "info.contact is not truthy",
    "path": Array [
      "info",
      "contact",
    ],
    "range": Object {
      "end": Object {
        "character": 65,
        "line": 0,
      },
      "start": Object {
        "character": 0,
        "line": 0,
      },
    },
    "severity": 1,
    "source": undefined,
    "summary": "Info object should contain \`contact\` object.",
  },
  Object {
    "code": "info-description",
    "message": "info.description is not truthy",
    "path": Array [
      "info",
      "description",
    ],
    "range": Object {
      "end": Object {
        "character": 65,
        "line": 0,
      },
      "start": Object {
        "character": 0,
        "line": 0,
      },
    },
    "severity": 1,
    "source": undefined,
    "summary": "OpenAPI object info \`description\` must be present and non-empty string.",
  },
  Object {
    "code": "oas2-schema",
    "message": "should have required property 'swagger'",
    "path": Array [],
    "range": Object {
      "end": Object {
        "character": 65,
        "line": 0,
      },
      "start": Object {
        "character": 0,
        "line": 0,
      },
    },
    "severity": 0,
    "source": undefined,
    "summary": "Validate structure of OpenAPIv2 specification.",
  },
  Object {
    "code": "api-host",
    "message": "host is not truthy",
    "path": Array [
      "host",
    ],
    "range": Object {
      "end": Object {
        "character": 65,
        "line": 0,
      },
      "start": Object {
        "character": 0,
        "line": 0,
      },
    },
    "severity": 1,
    "source": undefined,
    "summary": "OpenAPI \`host\` must be present and non-empty string.",
  },
  Object {
    "code": "api-schemes",
    "message": "schemes does not exist",
    "path": Array [
      "schemes",
    ],
    "range": Object {
      "end": Object {
        "character": 65,
        "line": 0,
      },
      "start": Object {
        "character": 0,
        "line": 0,
      },
    },
    "severity": 1,
    "source": undefined,
    "summary": "OpenAPI host \`schemes\` must be present and non-empty array.",
  },
  Object {
    "code": "oas3-schema",
    "message": "should have required property 'openapi'",
    "path": Array [],
    "range": Object {
      "end": Object {
        "character": 65,
        "line": 0,
      },
      "start": Object {
        "character": 0,
        "line": 0,
      },
    },
    "severity": 0,
    "source": undefined,
    "summary": "Validate structure of OpenAPIv3 specification.",
  },
  Object {
    "code": "api-servers",
    "message": "servers does not exist",
    "path": Array [
      "servers",
    ],
    "range": Object {
      "end": Object {
        "character": 65,
        "line": 0,
      },
      "start": Object {
        "character": 0,
        "line": 0,
      },
    },
    "severity": 1,
    "source": undefined,
    "summary": "OpenAPI \`servers\` must be present and non-empty array.",
  },
]
`);
    });
  });

  describe("OpenAPI 3.0", () => {
    spectral.addFunctions(oas3Functions());
    spectral.addRules(oas3Rules());
  });
});
