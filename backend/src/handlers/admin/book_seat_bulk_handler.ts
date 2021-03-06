import * as httpStatus from "http-status";
import { Observable } from "rxjs";
import { IParamsAndUserSession, IValidationItem } from "../../interfaces/common";
import { ISeatRequestModel } from "../../models/seat_request";
import queueService from "../../services/queue_service";
import seatRequestService from "../../services/seat_request_service";
import { logger } from "../../utils/logger";
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
            logger.info(`REQUEST => Admin request to book multiple seats for passengers:
                ${JSON.stringify(params)}
            `);
            if (!params.passengers || params.passengers.length === 0) {
                throw createHttpError("Passengers is required", httpStatus.BAD_REQUEST);
            }
            return seatRequestService.saveSeatRequest(params.passengers, params.flight_id)
                .mergeMap((seatRequest: ISeatRequestModel) => queueService.publishToQueue(seatRequest._id.toString()), (seatRequest: ISeatRequestModel) => seatRequest)
                .do((seatRequest: ISeatRequestModel) => logger.info(`RequestID ${seatRequest._id} successfully published to queue`))
                .map((seatRequest: ISeatRequestModel) => ({ request_id: seatRequest._id }));
        })
        .withResponseData()
        .process();
};

export { bookSeatsInBulkHandler };
