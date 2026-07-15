FROM node:16-alpine

WORKDIR /usr/src/spectral

COPY scripts/install.sh /usr/src/spectral/
COPY packages/cli/package.json /usr/src/spectral/
COPY packages/cli/package.json /usr/local/lib/package.json
RUN apk --no-cache add curl jq
ARG SPECTRAL_VERSION
RUN VERSION=${SPECTRAL_VERSION:-$(cat package.json | jq -r '.version')} \
  && ./install.sh $VERSION \
  && rm ./install.sh && rm ./package.json
ENV NODE_ENV production

COPY scarf-telemetry.js /usr/local/lib/scarf-telemetry.js

ENTRYPOINT ["sh", "-c", "node /usr/local/lib/scarf-telemetry.js & exec spectral \"$@\"", "sh"]
