const fs = require('fs');
const path = require('path');
const { Resolver } = require('@stoplight/json-ref-resolver');

module.exports = new Resolver({
  resolvers: {
    foo: {
      resolve(ref) {
        return new Promise((resolve, reject) => {
          fs.readFile(
            path.join(__dirname, ref.hostname()),
            'utf8',
            (err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve(data);
              }
            },
          );
        });
      },
    },
  },
});
