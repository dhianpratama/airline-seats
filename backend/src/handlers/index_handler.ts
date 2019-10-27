import { Observable } from "rxjs";
import { sendErrorResponse, sendJsendResponse } from "../utils/response";

const indexHandler = (requestObservable) => {
    return requestObservable
        .switchMapTo(Observable.of("Welcome to Airline Seats API"))
        .catch((err) => sendErrorResponse(requestObservable, err));
};

export { indexHandler };
