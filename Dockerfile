FROM node:12-alpine

RUN yarn global add @stoplight/spectral

ENTRYPOINT [ "spectral" ]
