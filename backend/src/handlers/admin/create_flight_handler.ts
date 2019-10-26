import { Observable } from "rxjs";
import { IListParams, IParamsAndUserSession, IValidationItem } from "../../interfaces/common";
import flightService from "../../services/flight_service";
import { BaseHandler, Database } from "../base/base_handler";

interface ICreateFlightParams extends IListParams {
    flight_number: string;
    input_data: [number[]];
}

const createValidation = () => {
    const validation = new Array<IValidationItem>();
    validation.push({ field: "flight_number", message: "Passengers is required" });
    validation.push({ field: "input_data", message: "flight_id is required" });

    return validation;
};

const createFlightHandler = (requestObservable: Observable<Request>) => {
    return new BaseHandler(requestObservable)
        .withAuthorization()
        .withValidation(createValidation())
        .withDatabase(Database.MONGO)
        .withLogic((data: IParamsAndUserSession<ICreateFlightParams>) => {
            const { params } = data;

            return flightService.createFlight(params);
        })
        .process();
};

export { createFlightHandler };
