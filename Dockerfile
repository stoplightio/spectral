FROM node:16-alpine

WORKDIR /usr/src/spectral

COPY scripts/install.sh /usr/src/spectral/
RUN ls -l
RUN apk --no-cache add curl
RUN ./install.sh
RUN rm ./install.sh
ENV NODE_ENV production

ENTRYPOINT [ "spectral" ]
