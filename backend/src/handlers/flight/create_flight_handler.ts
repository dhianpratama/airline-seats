import { Observable } from "rxjs";
import { IListParams, IParamsAndUserSession } from "../../interfaces/common";
import { IFlightSeatModel } from "../../models/flight_seat";
import flightService from "../../services/flight_service";
import { BaseHandler, Database } from "../base/base_handler";

interface ICreateFlightParams extends IListParams {
    code: string;
    input_data: [number[]];
}

const createFlightHandler = (requestObservable: Observable<Request>) => {
  return new BaseHandler(requestObservable)
    .withDatabase(Database.MONGO)
    .withLogic((data: IParamsAndUserSession<ICreateFlightParams>) => {
      const { params } = data;

      return flightService.createFlight(params);
    })
    .process();
};

export { createFlightHandler };
