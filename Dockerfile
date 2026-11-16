FROM node:26-alpine

WORKDIR /usr/src/spectral

COPY scripts/scarf-telemetry.js /usr/local/lib/scarf-telemetry.js
COPY packages/cli/package.json /usr/local/lib/package.json

RUN --mount=type=bind,source=scripts/install.sh,target=./install.sh \
    --mount=type=bind,source=packages/cli/package.json,target=./package.json \
    apk add --no-cache curl jq && ./install.sh "$(jq -r '.version' package.json)"

ENV NODE_ENV=production

ENTRYPOINT ["sh", "-c", "node /usr/local/lib/scarf-telemetry.js & exec spectral \"$@\"", "sh"]
