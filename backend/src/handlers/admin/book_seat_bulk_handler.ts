import * as httpStatus from "http-status";
import { Observable } from "rxjs";
import { IParamsAndUserSession, IValidationItem } from "../../interfaces/common";
import { ISeatRequestModel } from "../../models/seat_request";
import queueService from "../../services/queue_service";
import seatRequestService from "../../services/seat_request_service";
import { createHttpError } from "../../utils/response";
import { BaseHandler, Database } from "../base/base_handler";

interface IBookSeatsInBulkParams {
  passengers: string[];
  flight_id: string;
}

const createValidation = () => {
    const validation = new Array<IValidationItem>();
    validation.push({ field: "passengers", message: "Passengers is required" });
    validation.push({ field: "flight_id", message: "flight_id is required" });

    return validation;
};

const bookSeatsInBulkHandler = (requestObservable: Observable<Request>) => {
    return new BaseHandler(requestObservable)
        .withValidation(createValidation())
        .withAuthorization()
        .withDatabase(Database.MONGO)
        .withLogic((data: IParamsAndUserSession<IBookSeatsInBulkParams>) => {
            const { params } = data;
            if (!params.passengers || params.passengers.length === 0) {
                throw createHttpError("Passengers are required", httpStatus.BAD_REQUEST);
            }
            return seatRequestService.saveSeatRequest(params.passengers, params.flight_id)
                .mergeMap((seatRequest: ISeatRequestModel) => queueService.publishToQueue(seatRequest._id.toString()), (seatRequest: ISeatRequestModel) => seatRequest)
                .map((seatRequest: ISeatRequestModel) => ({ request_id: seatRequest._id }));
        })
        .withResponseData()
        .process();
};

export { bookSeatsInBulkHandler };
