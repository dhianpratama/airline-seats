import { Observable } from "rxjs";
import { IParamsAndUserSession } from "../../interfaces/common";
import { IFlightSeatModel } from "../../models/flight_seat";
import flightService from "../../services/flight_service";
import { BaseHandler, Database } from "../base/base_handler";

// tslint:disable-next-line:no-empty-interface
interface IListFlightSeatParams {
    flight_id: string;
}

const listFlightSeatHandler = (requestObservable: Observable<Request>) => {
  return new BaseHandler(requestObservable)
    .withDatabase(Database.MONGO)
    .withLogic((data: IParamsAndUserSession<IListFlightSeatParams>) => {
      const { params } = data;

      return flightService.listFlightSeat(params.flight_id)
        .map((flightSeats: IFlightSeatModel[]) => ({ flightSeats }));
    })
    .withResponseData()
    .process();
};

export { listFlightSeatHandler };
