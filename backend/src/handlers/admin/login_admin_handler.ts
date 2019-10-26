import * as httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import { Observable } from "rxjs";
import { DUMMY_ADMIN_USER, JWT_SECRET_KEY } from "../../constants/auth";
import { IParamsAndUserSession, IValidationItem } from "../../interfaces/common";
import { createHttpError } from "../../utils/response";
import { BaseHandler, Database } from "../base/base_handler";

interface ILoginAdminParams {
    username: string;
    password: string;
}

const createValidation = () => {
    const validation = new Array<IValidationItem>();
    validation.push({ field: "username", message: "Username is required" });
    validation.push({ field: "password", message: "Password is required" });

    return validation;
};

const loginAdminHandler = (requestObservable$: Observable<Request>) => {
    return new BaseHandler(requestObservable$)
        .withValidation(createValidation())
        .withDatabase(Database.MONGO)
        .withLogic((data: IParamsAndUserSession<ILoginAdminParams>) => {
            const { params } = data;
            console.log("PARAMS ", params);

            if (params.username === "admin" && params.password === "pass1234") {
                const token = jwt.sign(DUMMY_ADMIN_USER, JWT_SECRET_KEY);
                return Observable.of({ token });
            } else {
                throw createHttpError("Invalid username or password", httpStatus.UNAUTHORIZED);
            }
        })
        .withResponseData()
        .process();
};

export { loginAdminHandler };
