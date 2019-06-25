# JSON Ref Resolver

[![Maintainability](https://api.codeclimate.com/v1/badges/0b1d841cc2445e29ef50/maintainability)](https://codeclimate.com/github/stoplightio/json-ref-resolver/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/0b1d841cc2445e29ef50/test_coverage)](https://codeclimate.com/github/stoplightio/json-ref-resolver/test_coverage)

Dereference $ref values in JSON Schema, OpenAPI (Swagger), and any other objects with $ref values inside of them.

- View the changelog: [Releases](https://github.com/stoplightio/json-ref-resolver/releases)

### Features

- **Performant**: Hot paths are memoized, remote URIs are resolved concurrently, and the minimum surface area is crawled and resolved.
- **Caching**: Results from remote URIs are cached.
- **Immutable**: The original object is not changed, and structural sharing is used to only change relevant bits. [example test](src/__tests__/resolver.spec.ts#L182)
- **Reference equality:** $refs to the same location will resolve to the same object in memory. [example test](src/__tests__/resolver.spec.ts#L329)
- **Flexible:** Bring your own resolvers for `http://`, `file://`, `mongo://`, `custom://`... etc.
- **Cross Platform:** Supports POSIX and Windows style file paths.
- **Reliable:** Well tested to handle all sorts of circular reference edge cases.

### Installation

Supported in modern browsers and node.

```bash
# latest stable
yarn add @stoplight/json-ref-resolver
```

### Usage

All relevant types and options can be found in [src/types.ts](src/types.ts).

```ts
// Import the Resolver class.
import { Resolver } from "@stoplight/json-ref-resolver";

/**
 * Create a Resolver instance. Resolve can be called on this instance multiple times to take advantage of caching.
 *
 * @param globalOpts {IResolverOpts} [{}]
 *
 * These options are used on every resolve call for this resolver instance.
 *
 * See `IResolverOpts` interface defined in [src/types.ts](src/types.ts) for available options.
 *
 * @return IResolver
 */
const resolver = new Resolver(globalOpts);

/**
 * Resolve the passed in object, replacing all references.

 * @param resolveOpts {any} - The object to resolve.

 * @param resolveOpts {IResolveOpts} [{}]
 *
 * These options override any globalOpts specified on the resolver instance, and only apply during this resolve call.
 *
 * See `IResolveOpts` interface defined in [src/types.ts](src/types.ts) for available options.
 *
 * @return IResolveResult - see [src/types.ts](src/types.ts) for interface definition.
 */
const resolved = await resolver.resolve(sourceObj, resolveOpts);
```

#### Example: Basic Inline Dereferencing

By default, only inline references will be dereferenced.

```ts
import { Resolver } from "@stoplight/json-ref-resolver";

const resolver = new Resolver();
const resolved = await resolver.resolve({
  user: {
    $ref: "#/models/user"
  },
  models: {
    user: {
      name: "john"
    }
  }
});

// ==> result is the original object, with local refs resolved and replaced
expect(resolved.result).toEqual({
  user: {
    name: "json"
  },
  models: {
    user: {
      name: "john"
    }
  }
});
```

#### Example: Dereference a Subset of the Source

This will dereference the minimal number of references needed for the given target, and return the target.

In the example below, the address reference (`https://slow-website.com/definitions#/address`) will NOT be dereferenced, since
it is not needed to resolve the `#/user` jsonPointer target we have specified. However, `#/models/user/card` IS dereferenced since
it is needed in order to full dereference the `#/user` property.

```ts
import { Resolver } from "@stoplight/json-ref-resolver";

const resolver = new Resolver();
const resolved = await resolver.resolve(
  {
    user: {
      $ref: "#/models/user"
    },
    address: {
      $ref: "https://slow-website.com/definitions#/address"
    },
    models: {
      user: {
        name: "john",
        card: {
          $ref: "#/models/card"
        }
      },
      card: {
        type: "visa"
      }
    }
  },
  {
    jsonPointer: "#/user"
  }
);

// ==> result is the target object, with refs resolved and replaced
expect(resolved.result).toEqual({
  name: "json",
  card: {
    type: "visa"
  }
});
```

#### Example: Dereferencing Remote References with Resolvers

By default only inline references (those that point to values inside of the original object) are dereferenced.

In order to dereference remote URIs (file, http, etc) you must provide resolvers for each URI scheme.

Resolvers are keyed by scheme, receive the URI to fetch, and must return the fetched data.

```ts
import { Resolver } from "@stoplight/json-ref-resolver";

// some example http library
import * as axios from "axios";

// if we're in node, we create a file resolver with fs
import * as fs from "fs";

// create our resolver instance
const resolver = new Resolver({
  // resolvers can do anything, so long as they define an async read function that resolves to a value
  resolvers: {
    // this resolver will be invoked for refs with the https protocol
    https: {
      async resolve(ref: uri.URI) {
        return axios({
          method: "get",
          url: String(ref)
        });
      }
    },

    // this resolver will be invoked for refs with the file protocol
    file: {
      async resolve(ref: uri.URI) {
        return fs.read(String(ref));
      }
    }
  }
});

const resolved = await resolver.resolve({
  definitions: {
    someOASFile: {
      $ref: "./main.oas2.yml#/definitions/user"
    },
    someMarkdownFile: {
      $ref: "https://foo.com/intro.md"
    }
  }
});

// ==> result is the original object, with refs resolved and replaced
expect(resolved.result).toEqual({
  definitions: {
    someOASFile: {
      // ... the data located in the relative file `./main.oas2.yml` and inner json path `#/definitions/user`
    },
    someMarkdownFile: {
      // ... the data located at the url `https://foo.com/intro.md`
    }
  }
});
```

#### Example: Dereferencing Relative Remote References with the baseUri Option

If there are relative remote references (for example, a relative file path `../model.json`), then the location of the source
data must be specified via the `baseUri` option. Relative references will be dereferenced against this baseUri.

```ts
import { Resolver } from "@stoplight/json-ref-resolver";
import * as fs from "fs";
import * as URI from "urijs";

const resolver = new Resolver({
  readers: {
    file: {
      async read(ref: uri.URI) {
        return fs.read(String(ref));
      }
    }
  }
});

const sourcePath = "/specs/api.json";
const sourceData = fs.readSync(sourcePath);
// sourceData === {
//   user: {
//     $ref: "../models/user.json"
//   }
// }

const resolved = await resolver.resolve(sourceData, {
  // Indicate where the `sourceData` being resolved lives, so that relative remote references can be fetched and resolved.
  baseUri: new URI(sourcePath)
});

expect(resolved.result).toEqual({
  user: {
    // ... the user object defined in `../models/user.json`
  }
});
```

In the above example, the user \$ref will resolve to `/models/user.json`, because `../models/user.json` is resolved against the baseUri of the current document (which was indicated at `/specs/api.json`). Relative references will not work if the source document has no baseUri set.

### Contributing

1. Clone repo.
2. Create / checkout `feature/{name}`, `chore/{name}`, or `fix/{name}` branch.
3. Install deps: `yarn`.
4. Make your changes.
5. Run tests: `yarn test.prod`.
6. Stage relevant files to git.
7. Commit: `yarn commit`. _NOTE: Commits that don't follow the [conventional](https://github.com/marionebl/commitlint/tree/master/%40commitlint/config-conventional) format will be rejected. `yarn commit` creates this format for you, or you can put it together manually and then do a regular `git commit`._
8. Push: `git push`.
9. Open PR targeting the `develop` branch.
