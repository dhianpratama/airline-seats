// tslint:disable:no-implicit-dependencies
import axios from "axios";
import { expect } from "chai";
import "mocha";
import { Observable } from "rxjs";

const BASE_API_URL = process.env.BASE_API_URL || "http://localhost:8080";
const FLIGHT_NUMBER = "SQ-234-TEST";
const SEAT_MAP = [ [2, 3], [3, 4], [3, 2], [4, 3] ];
const TOTAL_PASSENGERS = 100;
const PASSENGERS = [];
for (let i = 1; i <= TOTAL_PASSENGERS; i++) {
    PASSENGERS.push(`Passenger-${i}`);
}
const PASSENGERS_REQUESTS = [];

let AUTH_TOKEN;
let FLIGHT_ID;

describe("Simulate Concurrency Testing", function () {
    this.timeout(3 * 60 * 1000);

    describe("Admin", function () {
        it("should logged-in successfully with the proper username and password", (done) => {
            const options = {
                method: "POST",
                url: `${BASE_API_URL}/admin/login`,
                data: {
                    username: "admin",
                    password: "pass1234",
                },
            };
            axios(options)
                .then((response) => {
                    const { status, data } = response.data;
                    expect(status).to.equal("success");
                    expect(data).to.have.property("token");
                    AUTH_TOKEN = data.token;
                    done();
                })
                .catch((error) => done(error));
        });

        it(`should saved flight data if all params are given correctly \n
            Flight number = ${FLIGHT_NUMBER} \n
            Seat map = ${JSON.stringify(SEAT_MAP)}`, (done) => {
            const options = {
                method: "POST",
                url: `${BASE_API_URL}/admin/flights`,
                headers: {
                    Authorization: `Bearer ${AUTH_TOKEN}`,
                },
                data: {
                    flight_number: FLIGHT_NUMBER,
                    seat_map: SEAT_MAP,
                },
            };
            axios(options)
                .then((response) => {
                    const { status, data } = response.data;
                    expect(status).to.equal("success");
                    expect(data).to.have.property("flight");
                    expect(data.flight).to.have.property("id");
                    expect(data.flight).to.have.property("flight_number");
                    expect(data.flight.flight_number).to.equal(FLIGHT_NUMBER);
                    FLIGHT_ID = data.flight.id;
                    done();
                })
                .catch((error) => done(error));
        });
    });

    describe(`Concurrent request ${TOTAL_PASSENGERS} passengers book at the same time`, function () {
        after(function () {
            setTimeout(() => {
                const options = {
                    method: "DELETE",
                    url: `${BASE_API_URL}/admin/flights/${FLIGHT_ID}`,
                    headers: {
                        Authorization: `Bearer ${AUTH_TOKEN}`,
                    },
                };
                axios(options)
                    .then(() => console.log(`Flight data ${FLIGHT_NUMBER} cleared.`))
                    .catch((error) => console.error(error));
            }, 3 * 1000);
        });

        it("all of them should be able to book and get request_id as response", (done) => {
            const bookPerPassenger = (name) => {
                const options = {
                    method: "POST",
                    url: `${BASE_API_URL}/flights/${FLIGHT_ID}/seats/book`,
                    data: {
                        username: name,
                    },
                };
                return axios(options);
            };

            const bookAllPassengers$ = PASSENGERS.map((passenger) =>
                Observable.fromPromise(bookPerPassenger(passenger))
                    .do((response) => {
                        const { status, data } = response.data;
                        expect(status).to.equal("success");
                        expect(data).to.have.property("request_id");
                        PASSENGERS_REQUESTS.push({
                            passenger,
                            requestId: data.request_id,
                        });
                    }),
                );
            Observable.zip(...bookAllPassengers$)
                .subscribe(
                    (result) => {
                        const totalRequest = PASSENGERS_REQUESTS.length;
                        expect(totalRequest).to.equal(TOTAL_PASSENGERS);
                        done();
                    },
                    (error) => done(error),
                );

        });
        it(`should 36 passengers have seat, ${TOTAL_PASSENGERS - 36} passengers no seat`, (done) => {
            const getRequestDetail = (requestId, callback) => {
                const options = {
                    method: "GET",
                    url: `${BASE_API_URL}/flights/seats/requests/${requestId}`,
                };
                axios(options)
                    .then((response) => {
                        const { status, data } = response.data;
                        if (data.seatRequest.status === "waiting") {
                            setTimeout(() => {
                                getRequestDetail(requestId, callback);
                            }, 3000);
                        } else if (data.seatRequest.status === "completed") {
                            let idxFound = -1;
                            // tslint:disable-next-line:prefer-for-of
                            for (let i = 0; i < PASSENGERS_REQUESTS.length; i++) {
                                const p = PASSENGERS_REQUESTS[i];
                                if (p.requestId === data.seatRequest.id) {
                                    idxFound = i;
                                    break;
                                }
                            }
                            PASSENGERS_REQUESTS[idxFound].is_success = data.seatRequest.result[0].is_success;
                            PASSENGERS_REQUESTS[idxFound].seat_number = data.seatRequest.result[0].seat_number;
                            PASSENGERS_REQUESTS[idxFound].error_message = data.seatRequest.result[0].error_message;
                            callback(undefined, data.seatRequest);
                        }
                    })
                    .catch((error) => callback(error));
            };

            const requestAllPassengers$ = PASSENGERS_REQUESTS.map((p) => {
                const getRequestDetail$ = Observable.bindCallback(getRequestDetail);
                return getRequestDetail$(p.requestId);
            });

            Observable.of({})
                .delay(10 * 1000)
                .switchMap(() => Observable.zip(...requestAllPassengers$))
                .subscribe(
                    () => {
                        const totalSuccess = PASSENGERS_REQUESTS.filter((p) => p.is_success).length;
                        const totalNoSeat = PASSENGERS_REQUESTS.filter((p) => !p.is_success && p.error_message === "No seat available").length;
                        expect(totalSuccess).to.equal(36);
                        expect(totalNoSeat).to.equal(TOTAL_PASSENGERS - 36);
                        done();
                    },
                    (error) => done(error),
                );

        });
    });
});
