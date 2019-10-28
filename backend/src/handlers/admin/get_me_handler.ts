import { Observable } from "rxjs";
import { IListParams, IParamsAndUserSession, IValidationItem } from "../../interfaces/common";
import { IFlightModel } from "../../models/flight";
import flightService from "../../services/flight_service";
import { BaseHandler, Database } from "../base/base_handler";

const getMeHandler = (requestObservable: Observable<Request>) => {
    return new BaseHandler(requestObservable)
        .withAuthorization()
        .withDatabase(Database.MONGO)
        .withLogic((data: IParamsAndUserSession<any>) => {
            const { userSession } = data;
            return Observable.of({ user: userSession });
        })
        .withResponseData()
        .process();
};

export { getMeHandler };
