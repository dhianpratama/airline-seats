import { Schema } from "mongoose";
import { Observable } from "rxjs";
import { SeatTypes } from "../constants/seat_types";
import { Flight, IFlightModel } from "../models/flight";
import { FlightSeat, IFlightSeatModel } from "../models/flight_seat";

class FlightService {

    public listFlight = (): Observable<IFlightModel[]> => {
        return Observable.fromPromise(Flight.find({}));
    }

    public createFlight = (data: any): Observable<IFlightModel> => {
        const flight = new Flight(data);
        return Observable.fromPromise(flight.save());
    }

    public generateFlightSeat = (flight: IFlightModel) => {

    }

    public generateFlightSeatDummy = (inputData: [number[]]): Observable<IFlightSeatModel[]> => {
        let seats: IFlightSeatModel[] = [];
        let totalAllColumns = 0;
        inputData.forEach((section: number[]) => {
            totalAllColumns += section[1];
        });
        inputData.forEach((section: number[], idxSection: number) => {
            const [ row, column ] = section;
            let sectionPosition;
            if (idxSection === 0) { sectionPosition = "left"; }
            else if (idxSection === inputData.length - 1) { sectionPosition = "right"; }
            else { sectionPosition = "middle"; }
            const sectionSeats = this.generateSeatsPerSection(row, column, idxSection, sectionPosition);
            seats = seats.concat(sectionSeats);
        });

        return Observable.of(seats);
    }

    public generateAllSeats = (inputData: [number[]]): Observable<IFlightSeatModel[]> => {
        const seats: IFlightSeatModel[] = [];
        let currentColumn = 0;
        inputData.forEach((section: number[], idxSection: number) => {
            console.log("NOW SECTION ", idxSection + 1);
            console.log("SECTION ", section);
            console.log("CURRENT COLUMN ", currentColumn);
            const [ totalRows, totalColumns ] = section;
            let sectionPosition;
            if (idxSection === 0) { sectionPosition = "left"; }
            else if (idxSection === inputData.length - 1) { sectionPosition = "right"; }
            else { sectionPosition = "middle"; }

            for (let r = 1; r <= totalRows; r++) {
                for (let c = 1; c <= totalColumns; c++) {
                    const seat = new FlightSeat();
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

    public generateSeatsPerSection = (totalRows: number, totalColumns: number, sectionIdx: number, sectionPosition: "left" | "middle" | "right"): IFlightSeatModel[] => {
        const sectionSeats: IFlightSeatModel[] = [];
        for (let r = 1; r <= totalRows; r++) {
            for (let c = 1; c <= totalColumns; c++) {
                const seat = new FlightSeat();
                seat.position = {
                    row: r,
                    column: (c + 9).toString(36).toUpperCase(),
                };
                seat.section = sectionIdx + 1;
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
                sectionSeats.push(seat);
            }
        }

        return sectionSeats;
    }

    public listFlightSeat = (flightId: string | Schema.Types.ObjectId): Observable<IFlightSeatModel[]> => {
        return Observable.fromPromise(FlightSeat.find({ flight: flightId }));
    }
}

export default new FlightService();
