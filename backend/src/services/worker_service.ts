import { Schema } from "mongoose";
import * as RSMQWorker from "rsmq-worker";
import { Observable } from "rxjs";
import { config } from "../config";
import { SeatRequestQueueName } from "../constants/queue";
import { IFlightSeatModel } from "../models/flight_seat";
import { ISeatRequestModel, SeatRequest } from "../models/seat_request";
import { logger } from "../utils/logger";
import flightService from "./flight_service";

class WorkerService {
    public startConsuming = (): void => {
        const worker = new RSMQWorker(SeatRequestQueueName, {
            host: config.redisHost,
            port: config.redisPort,
            maxReceiveCount: 1,
            timeout: 3 * 60 * 1000,
            alwaysLogErrors: true,
        });

        worker.on("message", (message, next, id): void => {
            console.log("Message id : " + id);
            console.log("Message content: ", message);
            const seatRequestId = message;
            this.processSeatRequest(seatRequestId)
                .subscribe(
                    () => next(),
                    (error: Error) => logger.error(`${error.stack}`),
                );
        });

        worker.start();
    }

    public processSeatRequest = (requestId: string): Observable<any> => {
        return Observable.fromPromise(SeatRequest.findById(requestId))
            .do((seatRequest: ISeatRequestModel) => {
                if (!seatRequest) {
                    throw new Error("Seat request not found");
                }
            })
            .mergeMap((seatRequest: ISeatRequestModel) => this.bookSeatPassengers(seatRequest), (seatRequest: ISeatRequestModel) => seatRequest)
            .switchMap((seatRequest: ISeatRequestModel) => this.updateSeatRequestToCompleted(seatRequest));
    }

    public bookSeatPassengers = (seatRequest: ISeatRequestModel, idx: number = 0) => {
        const passenger = seatRequest.passengers[idx];
        return flightService.bookSeat(seatRequest.flight, passenger)
            .switchMap((flightSeat: IFlightSeatModel) => flightSeat
                ? this.saveBookPassengerResult(seatRequest, flightSeat, passenger)
                : Observable.of(seatRequest))
            .switchMap((updatedSeatRequest: ISeatRequestModel) => idx < seatRequest.passengers.length - 1
                ? this.bookSeatPassengers(updatedSeatRequest, idx + 1)
                : Observable.of({}));
    }

    private saveBookPassengerResult = (seatRequest: ISeatRequestModel, flightSeat: IFlightSeatModel, passenger): Observable<ISeatRequestModel> => {
        const result = {
            passenger,
            flight_seat: flightSeat,
        } as any;
        if (flightSeat) {
            result.seat_number = `${flightSeat.position.row}${flightSeat.position.column}`;
            result.is_success = true;
        } else {
            result.is_success = false;
            result.error_message = "No seat available";
        }
        if (seatRequest.result) {
            seatRequest.result.push(result);
        } else {
            seatRequest.result = [ result ];
        }

        return Observable.fromPromise(seatRequest.save());
    }

    private updateSeatRequestToCompleted = (seatRequest: ISeatRequestModel): Observable<ISeatRequestModel> => {
        seatRequest.status = "completed";
        return Observable.fromPromise(seatRequest.save());
    }
}

export default new WorkerService();
