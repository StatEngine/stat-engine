# Based on https://github.com/angular-fullstack/angular-fullstack-dockerfile
FROM node:10

ARG AMPLITUDE_API_KEY
RUN echo $AMPLITUDE_API_KEY

ARG MAPBOX_TOKEN
RUN echo $MAPBOX_TOKEN

RUN apt-get update && apt-get install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++

# Global dependencies
RUN npm install -g node-gyp gulp

# Make src directory
RUN mkdir -p /usr/src/stat-engine
WORKDIR /usr/src/stat-engine

ENV NODE_PATH=/usr/local/lib/node_modules/:/usr/local/lib

# Install stat-engine dependencies
COPY package.json /usr/src/stat-engine/
COPY package-lock.json /usr/src/stat-engine/
RUN npm ci

# Copy rest of src over
COPY . /usr/src/stat-engine

# Build dist
ARG ON_PREMISE
RUN if [ "x$ON_PREMISE" = "x" ] ; then AMPLITUDE_API_KEY=${AMPLITUDE_API_KEY} MAPBOX_TOKEN=${MAPBOX_TOKEN} /usr/src/stat-engine/node_modules/gulp/bin/gulp.js build; else /usr/src/stat-engine/node_modules/gulp/bin/gulp.js build:onPremise; fi

# Run
ENV NODE_ENV=production

CMD [ "node", "/usr/src/stat-engine/dist/server/index.js" ]

EXPOSE 8080 50051
