import { Observable } from "rxjs";
import { IListParams, IParamsAndUserSession, IValidationItem } from "../../interfaces/common";
import { ISeatRequestModel } from "../../models/seat_request";
import queueService from "../../services/queue_service";
import seatRequestService from "../../services/seat_request_service";
import { logger } from "../../utils/logger";
import { BaseHandler, Database } from "../base/base_handler";

interface IBookSeatParams {
    username: string;
    flight_id: string;
}

const createValidation = () => {
    const validation = new Array<IValidationItem>();
    validation.push({ field: "username", message: "username is required" });
    validation.push({ field: "flight_id", message: "flight_id is required" });

    return validation;
};

const bookSeatHandler = (requestObservable: Observable<Request>) => {
    return new BaseHandler(requestObservable)
        .withValidation(createValidation())
        .withDatabase(Database.MONGO)
        .withLogic((data: IParamsAndUserSession<IBookSeatParams>) => {
            const { params } = data;
            logger.info(`REQUEST => Guest request to book a seat:
                ${JSON.stringify(params)}
            `);
            return seatRequestService.saveSeatRequest(params.username, params.flight_id)
                .mergeMap((seatRequest: ISeatRequestModel) => queueService.publishToQueue(seatRequest._id.toString()), (seatRequest: ISeatRequestModel) => seatRequest)
                .do((seatRequest: ISeatRequestModel) => logger.info(`RequestID ${seatRequest._id} successfully published to queue`))
                .map((seatRequest: ISeatRequestModel) => ({ request_id: seatRequest._id }));
        })
        .withResponseData()
        .process();
    };

export { bookSeatHandler };
