import { Observable } from "rxjs";
import { ISeatRequestModel, SeatRequest } from "../models/seat_request";

class SeatRequestService {
    public saveSeatRequest = (passenger: string | string[], flightId: string): Observable<ISeatRequestModel> => {
        const passengers: string[] = typeof passenger === "string"
            ? [ passenger ]
            : passenger;

        const seatRequest = new SeatRequest({
            passengers,
            flight: flightId,
        });

        return Observable.fromPromise(seatRequest.save());
    }
}

export default new SeatRequestService();
