# Use the official lightweight Node.js 15 image.
# https://hub.docker.com/_/node
FROM node:15-slim as base

# Create and change to the app directory.
WORKDIR /home/node/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install dependencies.
RUN npm install 

# Copy local code to the container image.
COPY ./src ./src
COPY tsconfig.json ./


# FROM base as production

# Build from typescript
ENV NODE_PATH=./dist

RUN npm run build

# Run the web service on container startup.
CMD [ "npm", "start" ]