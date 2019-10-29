BACKEND
============

This service consist of Http API and Worker Queue
- **HTTP API**: To server API for list flight, create flight, book seat, etc.
- **Worker Queue**: Consume data from queue for every book request. It will consume one by one so it can guarantee it won't get duplicate result because of race condition.

## How to run server

Development Mode
```
npm install
npm run start
```

Production mode
```
npm install
npm run serve
```

## How to run test
```
npm run test
```
Testing scopes
```
Admin Functionalities
- Login
- Create Flight consist of 36 seats
- Admin book 50 passengers using bulk booking API (1 time api call)
- Passenger 1 until 36 will get seats, 37 until 50 will have no seat.

Concurrency Testing
- Create flight consist of 36 seats
- 100 guest are calling guest book API at the same time
- Make sure only 36 passengers get seats
```

## Environment variables

* `NODE_ENV` (string): Environment mode. Default: `development`
* `PORT` (int): The port number the service will listen to. Default: `8080`
* `MONGO_URL` (string): MQTT connection string. Default: `mongodb://localhost:27017/airlineseat`
* `REDIS_HOST` (string): Redis host. Default: `localhost`
* `REDIS_PORT` (int): Redis port. Default: `6379`


# API Documentation
## Protected API (for admin)
### 1. `POST /admin/login`
Login for admin. Only have one account
username = admin
password = pass1234

```
Response 200
{
    "status": "success",
    "data": {
        "is_admin": true,
        "phone_number": "628211112223",
        "email": "admin@dummy.com",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey..."
    }
}
```

### 2. `POST /admin/flights`
Create new flight
Auth token required
```
Headers
{
    Authorization: Bearer <token>
}

Request Body
{
	"flight_number": "GA-454",
	"seat_map": [ [2,3], [3,4], [3,2], [4,3] ]
}
```

```
Response 200
{
    "status": "success",
    "data": {
        "flight": {
            "flight_number": "GA-454",
            "id": "5db60d98c03a6b3fec612277"
        }
    }
}
```


### 3. `POST /admin/flights/<flight_id>/seats/book/bulk`
Book seats for many passengers
Auth token required
```
Headers
{
    Authorization: Bearer <token>
}

Request Body
{
	"passengers": [
		"Muthi",
		"Lady",
		"Lean",
		"Dhian"
	]
}
```
```
Response 200
{
    "status": "success",
    "data": {
        "request_id": "5db60e57c03a6b3fec61229c"
    }
}
```

### 4. `DELETE /admin/flights/seats/<flight_seat_id>`
Remove passenger from seat
Auth token required
```
Headers
{
    Authorization: Bearer <token>
}
```
```
Response 200
{
    "status": "success"
}
```

### 4. `DELETE /admin/flights/<flight_id>`
Remove all data related to flight (for testing purpose)
Auth token required
```
Headers
{
    Authorization: Bearer <token>
}
```
```
Response 200
{
    "status": "success"
}
```

## Unprotected API (for public)
### 1. `GET /flights`
List flights
```
Response 200
{
    "status": "success",
    "data": {
        "flights": [
            {
                "seat_map": [ [2,3], [3,4], [3,2], [4,3] ],
                "flight_number": "GA-202",
                "created_at": "2019-10-27T20:49:05.904Z",
                "updated_at": "2019-10-27T20:49:05.904Z",
                "id": "5db602c1c2ac6d3da173269e"
            },
            {
                "seat_map": [ [2,3], [3,4], [3,2], [4,3] ],
                "flight_number": "GA-454",
                "created_at": "2019-10-27T21:35:20.576Z",
                "updated_at": "2019-10-27T21:35:20.576Z",
                "id": "5db60d98c03a6b3fec612277"
            }
        ]
    }
}
```

### 2. `GET /flights/<flight_id>/seats`
List seats by flight
```
Response 200
{
    "status": "success",
    "data": {
        "flightSeats": [
            {
                "position": {
                    "row": 1,
                    "column": "A"
                },
                "flight": "5db60d98c03a6b3fec612277",
                "section": 1,
                "seat_type": "window",
                "created_at": "2019-10-27T21:35:20.615Z",
                "updated_at": "2019-10-27T21:35:20.615Z",
                "id": "5db60d98c03a6b3fec612278",
                "seat_name": "1A",
                "is_occupied": false
            },
            {
                "position": {
                    "row": 1,
                    "column": "B"
                },
                "flight": "5db60d98c03a6b3fec612277",
                "section": 1,
                "seat_type": "middle",
                "created_at": "2019-10-27T21:35:20.615Z",
                "updated_at": "2019-10-27T21:35:20.615Z",
                "id": "5db60d98c03a6b3fec612279",
                "seat_name": "1B",
                "is_occupied": false
            },
            ...
            ...
            ...
        ]
    }
}
```

### 3. `POST /flights/<flight_id>/seats/book`
Book seat for a guest
```
Request Body
{
	"username": "The Rock Johnson"
}
```
```
Response 200
{
    "status": "success",
    "data": {
        "request_id": "5db60e57c03a6b3fec61229c"
    }
}
```


### 4. `GET /flights/seats/requests/<request_id>
Get seat result from by request_id given by book API

**status: "waiting"**
This means request still either in the queue or processing. Frontend should do pooling every X seconds until it get status completed. `result` field will be empty.
```
Response 200
{
    "status": "success",
    "data": {
        "seatRequest": {
            "passengers": [
                "Muthi",
                "Lady",
                ...
                ...
            ],
            "status": "waiting",
            "flight": "5db60d98c03a6b3fec612277",
            "result": [],
            "created_at": "2019-10-27T21:52:22.436Z",
            "updated_at": "2019-10-27T21:52:25.378Z",
            "id": "5db61196454b9d43dad7abf4"
        }
    }
}
```

**status: "completed"**
This means request is done and we can check which seat we get. `result` field will has value.
```
Response 200
{
    "status": "success",
    "data": {
        "seatRequest": {
            "passengers": [
                "Muthi",
                "Lady",
                ...
                ...
            ],
            "status": "completed",
            "flight": "5db60d98c03a6b3fec612277",
            "result": [
                {
                    "is_success": true,
                    "_id": "5db61199454b9d43dad7abf5",
                    "passenger": "Muthi",
                    "flight_seat": "5db60d98c03a6b3fec612290",
                    "seat_number": "1J"
                },
                {
                    "is_success": true,
                    "_id": "5db61199454b9d43dad7abf5",
                    "passenger": "Lady",
                    "flight_seat": "5db60d98c03a6b3fec612290",
                    "seat_number": "2C"
                },
                {
                    "is_success": false,
                    "_id": "5db602c3c2ac6d3da17326f2",
                    "passenger": "Passenger-47",
                    "error_message": "No seat available"
                },
                ...
                ...
            ],
            "created_at": "2019-10-27T21:52:22.436Z",
            "updated_at": "2019-10-27T21:52:25.378Z",
            "id": "5db61196454b9d43dad7abf4"
        }
    }
}
```
