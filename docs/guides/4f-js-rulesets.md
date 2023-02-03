## JavaScript Ruleset Format

Spectral v6.0 added support for a JavaScript ruleset format, similar to the JSON and YAML formats.

This has a few benefits:

- It lets you explicitly load formats or rulesets to get control over versioning.
- You can load common functions from popular JS libraries.
- It feels a lot more welcoming to developers experienced with JavaScript, especially when it comes to working with custom functions.

**Example**

To create a JavaScript ruleset, the first step is creating a folder. In your terminal, run the following commands:

```
mkdir style-guide
cd style-guide
```

Next, install two dependencies using [npm](https://www.npmjs.com/):

```
npm install --save @stoplight/spectral-functions
npm install --save @stoplight/spectral-formats
```

Installing these packages isn't required for creating a JavaScript ruleset, but you'll use them in the example to create some common rules used with Spectral and to target a specific OpenAPI format.

Next, create a JavaScript file to hold your ruleset:

```
touch spectral.js
```

Inside the file, create a couple of rules:

```js
import { truthy, undefined as pattern, schema } from "@stoplight/spectral-functions";
import { oas3 } from "@stoplight/spectral-formats";

export default {
  rules: {
    "api-home-get": {
      description: "APIs root path (`/`) MUST have a GET operation.",
      message: "Otherwise people won't know how to get it.",
      given: "$.paths[/]",
      then: {
        field: "get",
        function: truthy,
      },
      severity: "warn",
    },

    // Author: Phil Sturgeon (https://github.com/philsturgeon)
    "no-numeric-ids": {
      description: "Avoid exposing IDs as an integer, UUIDs are preferred.",
      given: '$.paths..parameters[*].[?(@property === "name" && (@ === "id" || @.match(/(_id|Id)$/)))]^.schema',
      then: {
        function: schema,
        functionOptions: {
          schema: {
            type: "object",
            not: {
              properties: {
                type: {
                  const: "integer",
                },
              },
            },
            properties: {
              format: {
                const: "uuid",
              },
            },
          },
        },
      },
      severity: "error",
    },

    // Author: Nauman Ali (https://github.com/naumanali-stoplight)
    "no-global-versioning": {
      description: "Using global versions just forces all your clients to do a lot more work for each upgrade. Please consider using API Evolution instead.",
      message: "Server URL should not contain global versions",
      given: "$.servers[*].url",
      then: {
        function: pattern,
        functionOptions: {
          notMatch: "/v[1-9]",
        },
      },
      formats: [oas3],
      severity: "warn",
    },
  },
};
```

If you use custom functions, the keywords `functions` and `functionOptions` have been removed, as they were designed to help Spectral find your functions. Now functions are passed as a variable, instead of using a string that contains the name like the JSON/YAML formats.

Next, publish the ruleset as an npm package, and then install that package as part of your API project and reference it in your Spectral ruleset as:

```
extends: ["@your-js-ruleset"]
```

Or using unpkg:

```
extends:
  - https://unpkg.com/@your-js-ruleset
```

For a more detailed example of creating a JavaScript ruleset and publishing it to npm, check out [Distribute Spectral Style Guides with npm](https://apisyouwonthate.com/blog/distribute-spectral-style-guides-with-npm) at APIs You Won't Hate.
