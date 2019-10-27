import { Observable } from "rxjs";
import { IListParams, IParamsAndUserSession, IValidationItem } from "../../interfaces/common";
import { ISeatRequestModel } from "../../models/seat_request";
import queueService from "../../services/queue_service";
import seatRequestService from "../../services/seat_request_service";
import { BaseHandler, Database } from "../base/base_handler";

interface IGetSeatRequestParams {
    request_id: string;
}

const createValidation = () => {
    const validation = new Array<IValidationItem>();
    validation.push({ field: "request_id", message: "request_id is required" });

    return validation;
};

const getSeatRequestHandler = (requestObservable: Observable<Request>) => {
    return new BaseHandler(requestObservable)
        .withValidation(createValidation())
        .withDatabase(Database.MONGO)
        .withLogic((data: IParamsAndUserSession<IGetSeatRequestParams>) => {
            const { params } = data;
            return seatRequestService.getSeatRequestDetail(params.request_id)
                .map((seatRequest: ISeatRequestModel) => ({ seatRequest}));
        })
        .withResponseData()
        .process();
    };

export { getSeatRequestHandler };
