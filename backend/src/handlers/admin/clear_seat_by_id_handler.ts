import { Observable } from "rxjs";
import { IListParams, IParamsAndUserSession, IValidationItem } from "../../interfaces/common";
import { IFlightModel } from "../../models/flight";
import flightService from "../../services/flight_service";
import { BaseHandler, Database } from "../base/base_handler";

interface IClearSeatByIdParams {
    flight_seat_id: string;
}

const createValidation = () => {
    const validation = new Array<IValidationItem>();
    validation.push({ field: "flight_seat_id", message: "flight_seat_id is required" });

    return validation;
};

const clearSeatByIdHandler = (requestObservable: Observable<Request>) => {
    return new BaseHandler(requestObservable)
        .withAuthorization()
        .withValidation(createValidation())
        .withDatabase(Database.MONGO)
        .withLogic((data: IParamsAndUserSession<IClearSeatByIdParams>) => {
            const { params } = data;

            return flightService.clearFlightSeatById(params.flight_seat_id);
        })
        .process();
};

export { clearSeatByIdHandler };
