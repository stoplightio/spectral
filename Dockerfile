FROM node:24-alpine

WORKDIR /usr/src/spectral

COPY scripts/install.sh /usr/src/spectral/
COPY scripts/scarf-telemetry.js /usr/local/lib/scarf-telemetry.js
COPY packages/cli/package.json /usr/src/spectral/
COPY packages/cli/package.json /usr/local/lib/package.json
RUN apk --no-cache add curl jq \
  && ./install.sh $(cat package.json | jq -r '.version') \
  && rm ./install.sh && rm ./package.json
ENV NODE_ENV production

ENTRYPOINT ["sh", "-c", "node /usr/local/lib/scarf-telemetry.js & exec spectral \"$@\"", "sh"]
