FROM node:10.15.3-alpine

# Global dependencies
RUN apk add --update git python && rm -rf /var/cache/apk/*

# App dependencies
WORKDIR /app
COPY package.json ./
RUN npm --allow-root install

# Build assets
COPY . ./

# Default runtime configs and helpers
EXPOSE 8080
CMD sync; /app/docker/start.sh