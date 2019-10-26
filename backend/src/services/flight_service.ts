import * as httpStatus from "http-status";
import { Schema } from "mongoose";
import { Observable } from "rxjs";
import { SeatTypes } from "../constants/seat_types";
import { Flight, IFlight, IFlightModel } from "../models/flight";
import { FlightSeat, IFlightSeatModel } from "../models/flight_seat";
import { createHttpError } from "../utils/response";

class FlightService {

    public listFlight = (): Observable<IFlightModel[]> => {
        return Observable.fromPromise(Flight.find({}));
    }

    public createFlight = (data: IFlight): Observable<any> => {
        const flight = new Flight(data);
        return Observable.fromPromise(flight.save())
            .switchMap((flight: IFlightModel) => this.generateAllSeats(flight))
            .switchMap((flightSeats: IFlightSeatModel[]) => this.saveSeats(flightSeats));
    }

    public listFlightSeat = (flightId: string | Schema.Types.ObjectId): Observable<IFlightSeatModel[]> => {
        return Observable.fromPromise(FlightSeat.find({ flight: flightId }).sort([["position.row", 1], ["position.column", 1]]).exec());
    }

    public bookSeat = (flightId: string | Schema.Types.ObjectId, passengerName: string) => {
        return this.getFlightById(flightId)
            .do((flight: IFlightModel) => {
                if (!flight) {
                    throw createHttpError("Flight not found", httpStatus.NOT_FOUND);
                }
            })
            .switchMap(() => this.findAvailableSeat(flightId))
            .switchMap((data: any) => data.available === true
                ? this.occupySeatWithUsername(data.flightSeat, passengerName)
                : Observable.of({}),
            );
    }

    private generateAllSeats = (flight: IFlightModel): Observable<IFlightSeatModel[]> => {
        const { input_data: inputData } = flight;
        const seats: IFlightSeatModel[] = [];
        let currentColumn = 0;
        inputData.forEach((section: number[], idxSection: number) => {
            const [ totalRows, totalColumns ] = section;
            let sectionPosition;
            if (idxSection === 0) { sectionPosition = "left"; }
            else if (idxSection === inputData.length - 1) { sectionPosition = "right"; }
            else { sectionPosition = "middle"; }

            for (let r = 1; r <= totalRows; r++) {
                for (let c = 1; c <= totalColumns; c++) {
                    const seat = new FlightSeat();
                    seat.flight = flight._id;
                    seat.position = {
                        row: r,
                        column: ((currentColumn + c) + 9).toString(36).toUpperCase(),
                    };
                    seat.section = idxSection + 1;
                    if (sectionPosition === "left") {
                        if (c === 1) { seat.seat_type = SeatTypes.Window; }
                        else if (c === totalColumns) { seat.seat_type = SeatTypes.Aisle; }
                        else { seat.seat_type = SeatTypes.Middle; }
                    } else if (sectionPosition === "middle") {
                        // tslint:disable-next-line:prefer-conditional-expression
                        if (c === 1 || c === totalColumns) { seat.seat_type = SeatTypes.Aisle; }
                        else { seat.seat_type = SeatTypes.Middle; }
                    } else if (sectionPosition === "right") {
                        if (c === 1) { seat.seat_type = SeatTypes.Aisle; }
                        else if (c === totalColumns) { seat.seat_type = SeatTypes.Window; }
                        else { seat.seat_type = SeatTypes.Middle; }
                    }
                    seats.push(seat);
                }
            }

            currentColumn += totalColumns;
        });

        return Observable.of(seats);
    }

    private findAvailableSeat = (flightId: string | Schema.Types.ObjectId, typeSequence: number = 0) => {
        const types = [ "aisle", "window", "middle" ];
        if (typeSequence > types.length - 1) {
            return Observable.of({ available: false, flightSeat: undefined });
        }

        const selectedType = types[typeSequence];
        return Observable
            .fromPromise(FlightSeat.findOne({
                flight: flightId,
                occupied_by: { $exists: false },
                seat_type: selectedType,
            }).sort([["position.row", 1], ["position.column", 1]]))
            .switchMap((flightSeat: IFlightSeatModel) => {
                if (!flightSeat) {
                    return this.findAvailableSeat(flightId, typeSequence + 1);
                }

                return Observable.of({ available: true, flightSeat });
            });
    }

    private getFlightById = (flightId: string | Schema.Types.ObjectId): Observable<IFlightModel> => {
        return Observable.fromPromise(Flight.findById(flightId));
    }

    private saveSeats = (flightSeats: IFlightSeatModel[]) => {
        return Observable.fromPromise(FlightSeat.insertMany(flightSeats));
    }

    private occupySeatWithUsername = (flightSeat: IFlightSeatModel, username: string) => {
        flightSeat.occupied_by = username;
        return Observable.fromPromise(flightSeat.save());
    }
}

export default new FlightService();
