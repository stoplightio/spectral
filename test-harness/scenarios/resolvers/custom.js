const { Resolver } = require('@stoplight/json-ref-resolver');

module.exports = new Resolver({
  resolvers: {
    custom: {
      async resolve() {
        return `{ "user": "Stoplight" }`;
      }
    }
  }
});
