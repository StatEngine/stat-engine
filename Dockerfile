# Based on https://github.com/angular-fullstack/angular-fullstack-dockerfile
FROM node:6

# Global dependencies
RUN npm install -g node-gyp pm2 gulp

# Make src directory
RUN mkdir -p /usr/src/stat-engine
WORKDIR /usr/src/stat-engine

ENV NODE_PATH=/usr/local/lib/node_modules/:/usr/local/lib

# Install stat-engine dependencies
COPY package.json /usr/src/stat-engine/
RUN npm install

# Copy rest of src over
COPY . /usr/src/stat-engine

# Build dist
RUN /usr/src/stat-engine/node_modules/gulp/bin/gulp.js build

# Run pm2
ENV NODE_ENV=production
CMD [ "pm2-docker", "start", "pm2.json" ]

EXPOSE 8080
