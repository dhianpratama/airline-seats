// tslint:disable:no-implicit-dependencies
import axios from "axios";
import { expect } from "chai";
import "mocha";

const BASE_API_URL = process.env.BASE_API_URL || "http://localhost:8080";

let AUTH_TOKEN;
let FLIGHT_ID;

describe("Admin - Login", function () {
    this.timeout(60 * 1000);

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
