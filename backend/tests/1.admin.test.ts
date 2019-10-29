// tslint:disable:no-implicit-dependencies
import axios from "axios";
import { expect } from "chai";
import "mocha";

const BASE_API_URL = process.env.BASE_API_URL || "http://localhost:8080";
const FLIGHT_NUMBER = "GA-919-TEST";
const SEAT_MAP = [ [2, 3], [3, 4], [3, 2], [4, 3] ];
const TOTAL_PASSENGERS = 50;
const PASSENGERS = [];
for (let i = 1; i <= TOTAL_PASSENGERS; i++) {
    PASSENGERS.push(`Passenger-${i}`);
}

let AUTH_TOKEN;
let FLIGHT_ID;
let REQUEST_ID;

describe("Running Test for ADMIN user", function () {
    this.timeout(3 * 60 * 1000);

    describe("Login", function () {
        it("should throw error if password is not given", (done) => {
            const options = {
                method: "POST",
                url: `${BASE_API_URL}/admin/login`,
                data: {
                    username: "admin",
                },
            };
            axios(options)
                .catch((error) => {
                    const { status, message } = error.response.data;
                    expect(status).to.equal("failed");
                    expect(message).to.equal("Password is required");
                    done();
                });
        });

        it("should throw error if username and password is wrong", (done) => {
            const options = {
                method: "POST",
                url: `${BASE_API_URL}/admin/login`,
                data: {
                    username: "admin",
                    password: "thisiswrongpassword",
                },
            };
            axios(options)
                .catch((error) => {
                    const { status, message } = error.response.data;
                    expect(status).to.equal("failed");
                    expect(message).to.equal("Invalid username or password");
                    done();
                });
        });

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
    });

    describe("Create new flight", function () {
        it("should throw error without authorization header", (done) => {
            const options = {
                method: "POST",
                url: `${BASE_API_URL}/admin/flights`,
            };
            axios(options)
                .catch((error) => {
                    const { status, message } = error.response.data;
                    expect(status).to.equal("failed");
                    expect(message).to.equal("Unauthorized");
                    done();
                });
        });
        it("should throw error with the wrong authorization header", (done) => {
            const dummyAuthToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRHVtbXkgQWRtaW4iLCJpc19hZG1pbiI6dHJ1ZSwicGhvbmVfbnVtYmVyIjoiNjI4MjExMTEyMjIzIiwiZW1haWwiOiJhZG1pbkBkdW1teS5jb20iLCJpYXQiOjE1NzIxMjU4MzV9.UJLxL28oHTBn5CpFsdbwNe3z3LdqrJQrAhON3TV7kkk";
            const options = {
                method: "POST",
                url: `${BASE_API_URL}/admin/flights`,
                headers: {
                    Authorization: `Bearer ${dummyAuthToken}`,
                },
            };
            axios(options)
                .catch((error) => {
                    const { status, message } = error.response.data;
                    expect(status).to.equal("failed");
                    expect(message).to.equal("Unauthorized");
                    done();
                });
        });
        it("should throw error if params is not completed", (done) => {
            const options = {
                method: "POST",
                url: `${BASE_API_URL}/admin/flights`,
                headers: {
                    Authorization: `Bearer ${AUTH_TOKEN}`,
                },
                data: {
                    flight_number: FLIGHT_NUMBER,
                },
            };
            axios(options)
                .catch((error) => {
                    const { status, message } = error.response.data;
                    expect(status).to.equal("failed");
                    done();
                });
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

    describe("Book Seats for Passengers", function () {
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
        it("should throw error without authorization header", (done) => {
            const options = {
                method: "POST",
                url: `${BASE_API_URL}/admin/flights/${FLIGHT_ID}/seats/book/bulk`,
            };
            axios(options)
                .catch((error) => {
                    const { status, message } = error.response.data;
                    expect(status).to.equal("failed");
                    expect(message).to.equal("Unauthorized");
                    done();
                });
        });
        it("should throw error if passengers is empty", (done) => {
            const options = {
                method: "POST",
                url: `${BASE_API_URL}/admin/flights/${FLIGHT_ID}/seats/book/bulk`,
                headers: {
                    Authorization: `Bearer ${AUTH_TOKEN}`,
                },
                data: {
                    passengers: [],
                },
            };
            axios(options)
                .catch((error) => {
                    const { status, message } = error.response.data;
                    expect(status).to.equal("failed");
                    expect(message).to.equal("Passengers is required");
                    done();
                });
        });
        it(`should process successfully with ${TOTAL_PASSENGERS} passengers`, (done) => {
            const options = {
                method: "POST",
                url: `${BASE_API_URL}/admin/flights/${FLIGHT_ID}/seats/book/bulk`,
                headers: {
                    Authorization: `Bearer ${AUTH_TOKEN}`,
                },
                data: {
                    passengers: PASSENGERS,
                },
            };
            axios(options)
                .then((response) => {
                    const { status, data } = response.data;
                    expect(status).to.equal("success");
                    expect(data).to.have.property("request_id");
                    REQUEST_ID = data.request_id;
                    done();
                })
                .catch((error) => done(error));
        });
        it("all passengers should have seat number correctly", (done) => {
            const getRequestDetail = (callback) => {
                const options = {
                    method: "GET",
                    url: `${BASE_API_URL}/flights/seats/requests/${REQUEST_ID}`,
                };
                axios(options)
                    .then((response) => {
                        const { status, data } = response.data;
                        if (data.seatRequest.status === "waiting") {
                            setTimeout(() => {
                                getRequestDetail(callback);
                            }, 3000);
                        } else if (data.seatRequest.status === "completed") {
                            callback(undefined, data.seatRequest);
                        }
                    })
                    .catch((error) => callback(error));
            };

            getRequestDetail((error, seatRequest) => {
                if (error) {
                    return done(error);
                }
                seatRequest.result.forEach((res, idx) => {
                    if (res.passenger === "Passenger-1") { expect(res.seat_number).to.equal("1C"); }
                    if (res.passenger === "Passenger-2") { expect(res.seat_number).to.equal("1D"); }
                    if (res.passenger === "Passenger-3") { expect(res.seat_number).to.equal("1G"); }
                    if (res.passenger === "Passenger-4") { expect(res.seat_number).to.equal("1H"); }
                    if (res.passenger === "Passenger-5") { expect(res.seat_number).to.equal("1I"); }
                    if (res.passenger === "Passenger-6") { expect(res.seat_number).to.equal("1J"); }
                    if (res.passenger === "Passenger-7") { expect(res.seat_number).to.equal("2C"); }
                    if (res.passenger === "Passenger-8") { expect(res.seat_number).to.equal("2D"); }
                    if (res.passenger === "Passenger-9") { expect(res.seat_number).to.equal("2G"); }
                    if (res.passenger === "Passenger-10") { expect(res.seat_number).to.equal("2H"); }
                    if (res.passenger === "Passenger-11") { expect(res.seat_number).to.equal("2I"); }
                    if (res.passenger === "Passenger-12") { expect(res.seat_number).to.equal("2J"); }
                    if (res.passenger === "Passenger-13") { expect(res.seat_number).to.equal("3D"); }
                    if (res.passenger === "Passenger-14") { expect(res.seat_number).to.equal("3G"); }
                    if (res.passenger === "Passenger-15") { expect(res.seat_number).to.equal("3H"); }
                    if (res.passenger === "Passenger-16") { expect(res.seat_number).to.equal("3I"); }
                    if (res.passenger === "Passenger-17") { expect(res.seat_number).to.equal("3J"); }
                    if (res.passenger === "Passenger-18") { expect(res.seat_number).to.equal("4J"); }
                    if (res.passenger === "Passenger-19") { expect(res.seat_number).to.equal("1A"); }
                    if (res.passenger === "Passenger-20") { expect(res.seat_number).to.equal("1L"); }
                    if (res.passenger === "Passenger-21") { expect(res.seat_number).to.equal("2A"); }
                    if (res.passenger === "Passenger-22") { expect(res.seat_number).to.equal("2L"); }
                    if (res.passenger === "Passenger-23") { expect(res.seat_number).to.equal("3L"); }
                    if (res.passenger === "Passenger-24") { expect(res.seat_number).to.equal("4L"); }
                    if (res.passenger === "Passenger-25") { expect(res.seat_number).to.equal("1B"); }
                    if (res.passenger === "Passenger-26") { expect(res.seat_number).to.equal("1E"); }
                    if (res.passenger === "Passenger-27") { expect(res.seat_number).to.equal("1F"); }
                    if (res.passenger === "Passenger-28") { expect(res.seat_number).to.equal("1K"); }
                    if (res.passenger === "Passenger-29") { expect(res.seat_number).to.equal("2B"); }
                    if (res.passenger === "Passenger-30") { expect(res.seat_number).to.equal("2E"); }
                    if (res.passenger === "Passenger-31") { expect(res.seat_number).to.equal("2F"); }
                    if (res.passenger === "Passenger-32") { expect(res.seat_number).to.equal("2K"); }
                    if (res.passenger === "Passenger-33") { expect(res.seat_number).to.equal("3E"); }
                    if (res.passenger === "Passenger-34") { expect(res.seat_number).to.equal("3F"); }
                    if (res.passenger === "Passenger-35") { expect(res.seat_number).to.equal("3K"); }
                    if (res.passenger === "Passenger-36") { expect(res.seat_number).to.equal("4K"); }
                });
                done();
            });
        });
    });
});
