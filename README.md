Airline Seats Placement
============

HTTP API to server auto generated seats placement based on this rules
```
RULES FOR SEATING:
=> Always seat passengers starting from the front row to back, starting from the left to the right
=> Fill aisle seats first followed by window seats followed by center seats (any order in center seats)

INPUT:
=> a 2D array that represents the rows and columns e.g: [[3,4], [4,5], [2,3], [3,4]]
=> The number of passengers waiting in the queue.
```


## How to run server
### Production (recommended)
```
docker-compose build
docker-compose up -d
```
### Development
```
PREREQUISITES
=> Mongodb running and accessible on localhost:27017
=> Redis running and accessible on localhost:6379

cd backend
npm install
npm run start
```

## How to run test
Assume the app is already running at localhost:8080
```
npm run test
```

## Design Flow

![Alt Text](https://raw.githubusercontent.com/dhianpratama/smart-online-indicator/master/diagrams/Online%20Indicator%20using%20MQTT.png)

## Environment Variables
All environment variables that is currently set can be seen in `docker-compose.yml`

```
version: '3.1'

services:

  redis:
    image: redis
    container_name: redis
    restart: always
    volumes:
      - redis:/data

  mosca-broker:
    build:
      context: mosca-broker/.
      dockerfile: docker/Dockerfile
    container_name: mosca-broker
    environment:
      - "NODE_ENV=production"
      - "MQTT_PORT=1833"
      - "WS_PORT=1884"
    restart: always
    ports:
      - 1833:1833
      - 1884:1884

  presence:
    build:
      context: presence/.
      dockerfile: docker/Dockerfile
    container_name: presence
    environment:
      - "NODE_ENV=production"
      - "MQTT_URL=mqtt://mosca-broker:1833"
      - "REDIS_URL=redis://redis:6379"
      - "REDIS_HOST=redis"
      - "REDIS_PORT=6379"
    restart: always

  user-status:
    build:
      context: user-status/.
      dockerfile: docker/Dockerfile
    container_name: user-status
    ports:
      - 8080:8080
    environment:
      - "NODE_ENV=production"
      - "PORT=8080"
      - "MQTT_URL=mqtt://mosca-broker:1833"
      - "REDIS_URL=redis://redis:6379"
      - "REDIS_HOST=redis"
      - "REDIS_PORT=6379"
      - "OFFLINE_THRESHOLD_IN_MINUTES=2"
    restart: always
  
  offline-checker-cron:
    build:
      context: offline-checker-cron/.
      dockerfile: docker/Dockerfile
    container_name: offline-checker-cron
    environment:
      - "NODE_ENV=production"
      - "INTERVAL=60000"
      - "USER_STATUS_BASE_URL=http://user-status:8080"
    restart: always
  
  client-sample:
    build:
      context: client-sample/.
      dockerfile: docker/Dockerfile
    container_name: client-sample
    ports:
      - 80:80
    restart: always

volumes:
  redis:

```