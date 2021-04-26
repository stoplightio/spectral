> JSON Schema validation for Human 👨‍🎤

Main goal of this library is to provide relevant AJV error messages. It's a fork
of great [better-ajv-errors](https://github.com/atlassian/better-ajv-errors) by
Atlassian, with focus on being leaner.

## Installation

```bash
$ yarn add @stoplight/better-ajv-errors
```

or

```bash
$ npm i @stoplight/better-ajv-errors
```

Also make sure that you installed [ajv](https://www.npmjs.com/package/ajv)
package to validate data against JSON schemas.

## Usage

First, you need to validate your payload with `ajv`. If it's invalid then you
can pass `validate.errors` object into `better-ajv-errors`.

```js
import Ajv from 'ajv';
import betterAjvErrors from '@stoplight/better-ajv-errors';
// const Ajv = require('ajv');
// const betterAjvErrors = require('better-ajv-errors');

// You need to pass `jsonPointers: true`
const ajv = new Ajv({ jsonPointers: true });

// Load schema and data
const schema = ...;
const data = ...;

const validate = ajv.compile(schema);
const valid = validate(data);

if (!valid) {
  const output = betterAjvErrors(schema, validate.errors, {
    propertyPath: [],
    targetValue: data,
  });
  console.log(output);
}
```

## API

### betterAjvErrors(schema, data, errors, [options])

Returns formatted validation error to **print** in `console`. See
[`options.format`](#format) for further details.

#### schema

Type: `Object`

The JSON Schema you used for validation with `ajv`.

#### errors

Type: `Array`

Array of
[ajv validation errors](https://github.com/epoberezkin/ajv#validation-errors)

#### options

Type: `Object`

##### propertyPath

Type: `Array`

Property path of a validated object that is a part of a bigger document. Might
be empty if the validated object equals the whole document.

##### targetValue

Type: `Object`

The JSON payload you validate against using `ajv`.
