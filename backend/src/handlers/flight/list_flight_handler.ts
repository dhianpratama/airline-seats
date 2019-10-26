import { Observable } from "rxjs";
import { IListParams, IParamsAndUserSession } from "../../interfaces/common";
import { IFlightModel } from "../../models/flight";
import flightService from "../../services/flight_service";
import { BaseHandler, Database } from "../base/base_handler";

// tslint:disable-next-line:no-empty-interface
interface IListFlightParams extends IListParams {

}

const listFlightHandler = (requestObservable: Observable<Request>) => {
  return new BaseHandler(requestObservable)
    .withDatabase(Database.MONGO)
    .withLogic((data: IParamsAndUserSession<IListFlightParams>) => {
      const { params } = data;

      return flightService.listFlight()
        .map((flights: IFlightModel[]) => ({ flights }));
    })
    .withResponseData()
    .process();
};

export { listFlightHandler };
