import { Observable } from "rxjs";
import { IParamsAndUserSession } from "../../interfaces/common";
import { ISeatRequestModel } from "../../models/seat_request";
import queueService from "../../services/queue_service";
import seatRequestService from "../../services/seat_request_service";
import { BaseHandler, Database } from "../base/base_handler";

interface IBookSeatsInBulkParams {
  passengers: string[];
  flight_id: string;
}

const bookSeatsInBulkHandler = (requestObservable: Observable<Request>) => {
  return new BaseHandler(requestObservable)
    .withDatabase(Database.MONGO)
    .withLogic((data: IParamsAndUserSession<IBookSeatsInBulkParams>) => {
        const { params } = data;
        return seatRequestService.saveSeatRequest(params.passengers, params.flight_id)
            .mergeMap((seatRequest: ISeatRequestModel) => queueService.publishToQueue(seatRequest._id.toString()), (seatRequest: ISeatRequestModel) => seatRequest)
            .map((seatRequest: ISeatRequestModel) => ({ request_id: seatRequest._id }));
    })
    .withResponseData()
    .process();
};

export { bookSeatsInBulkHandler };
