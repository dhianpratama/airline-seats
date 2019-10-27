Airline Seats Placement
============

HTTP API to server auto generated seats placement based on this rules
![Problems](https://raw.githubusercontent.com/dhianpratama/airline-seats/master/diagrams/problem.png)


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

## API Documentation
[Click here for API Documentation](backend/README.md)

## Design Flow
This service consist of Http API and Worker Queue
- **HTTP API**: To server API for list flight, create flight, book seat, etc.
- **Worker Queue**: Consume data from queue for every book request. It will consume one by one so it can guarantee it won't get duplicate result because of race condition.

![Flow](https://raw.githubusercontent.com/dhianpratama/airline-seats/master/diagrams/Airline%20Seats%20Placement.png)

