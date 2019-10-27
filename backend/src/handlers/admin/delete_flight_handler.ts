import { Observable } from "rxjs";
import { IListParams, IParamsAndUserSession, IValidationItem } from "../../interfaces/common";
import { IFlightModel } from "../../models/flight";
import flightService from "../../services/flight_service";
import { BaseHandler, Database } from "../base/base_handler";

interface IDeleteFlightParams {
    flight_id: string;
}

const createValidation = () => {
    const validation = new Array<IValidationItem>();
    validation.push({ field: "flight_id", message: "flight_id is required" });

    return validation;
};

const deleteFlightHandler = (requestObservable: Observable<Request>) => {
    return new BaseHandler(requestObservable)
        .withAuthorization()
        .withValidation(createValidation())
        .withDatabase(Database.MONGO)
        .withLogic((data: IParamsAndUserSession<IDeleteFlightParams>) => {
            const { params } = data;

            return flightService.deleteFlight(params.flight_id);
        })
        .process();
};

export { deleteFlightHandler };
