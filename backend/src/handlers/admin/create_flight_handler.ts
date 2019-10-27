import { Observable } from "rxjs";
import { IListParams, IParamsAndUserSession, IValidationItem } from "../../interfaces/common";
import { IFlightModel } from "../../models/flight";
import flightService from "../../services/flight_service";
import { BaseHandler, Database } from "../base/base_handler";

interface ICreateFlightParams {
    flight_number: string;
    seat_map: [number[]];
}

const createValidation = () => {
    const validation = new Array<IValidationItem>();
    validation.push({ field: "flight_number", message: "flight_number is required" });
    validation.push({ field: "seat_map", message: "seat_map is required" });

    return validation;
};

const createFlightHandler = (requestObservable: Observable<Request>) => {
    return new BaseHandler(requestObservable)
        .withAuthorization()
        .withValidation(createValidation())
        .withDatabase(Database.MONGO)
        .withLogic((data: IParamsAndUserSession<ICreateFlightParams>) => {
            const { params } = data;

            return flightService.createFlight(params)
                .map((flight: IFlightModel) => ({ flight_number: flight.flight_number, id: flight._id }))
                .map((flight) => ({ flight }));
        })
        .withResponseData()
        .process();
};

export { createFlightHandler };
