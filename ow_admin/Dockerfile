FROM mhart/alpine-node:8

ENV APP_DIR "/usr/src/app"
RUN mkdir -p "APP_DIR"
WORKDIR "$APP_DIR"

RUN pwd

RUN apk -v --update add \
  bash \
  && \
  rm /var/cache/apk/*

COPY package.json ./
RUN npm install

COPY ./ ./

ENV REACT_APP_GRAPHQL_ENDPOINT null

CMD ["npm", "run", "build"]
