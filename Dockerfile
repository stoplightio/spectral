FROM node:16-alpine

WORKDIR /usr/src/spectral

COPY scripts/install.sh /usr/src/spectral/
COPY packages/cli/package.json /usr/src/spectral/
RUN apk --no-cache add curl jq
RUN ./install.sh $(cat package.json | jq -r '.version') \
  && rm ./install.sh && rm ./package.json
ENV NODE_ENV production

ENTRYPOINT [ "spectral" ]
