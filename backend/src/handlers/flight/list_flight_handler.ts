import { Observable } from "rxjs";
import { IFlightModel } from "../../models/flight";
import flightService from "../../services/flight_service";
import { BaseHandler, Database } from "../base/base_handler";

const listFlightHandler = (requestObservable: Observable<Request>) => {
  return new BaseHandler(requestObservable)
    .withDatabase(Database.MONGO)
    .withLogic(() => {
      return flightService.listFlight()
        .map((flights: IFlightModel[]) => ({ flights }));
    })
    .withResponseData()
    .process();
};

export { listFlightHandler };
