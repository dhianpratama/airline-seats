import { Document, Model, model, Schema } from "mongoose";
import { DEFAULT_TIMESTAMPS_CONFIG } from "../constants/mongoose";
import { BaseSchema } from "./base/base_schema";
import { FlightSeat } from "./flight_seat";

export interface ISeatRequest {
    flight: string | Schema.Types.ObjectId;
    passengers: string[];
    result: [{
        passenger: string;
        seat_number?: string;
        flight_seat?: string | Schema.Types.ObjectId;
        is_success: boolean;
        error_message?: string;
    }];
}

export interface ISeatRequestModel extends ISeatRequest, Document {}

const schema = new BaseSchema(
  {
    flight: { type: Schema.Types.ObjectId, required: true },
    passengers: [{ type: String, required: true }],
    result: [{
        passenger: { type: String, required: true },
        seat_number: { type: String },
        flight_seat: { type: Schema.Types.ObjectId, ref: FlightSeat },
        is_success: { type: Boolean, default: false },
        error_message: { type: String },
    }],
  },
  {
    timestamps: DEFAULT_TIMESTAMPS_CONFIG,
    versionKey: false,
  },
);

export const SeatRequest: Model<ISeatRequestModel> = model<ISeatRequestModel>("SeatRequest", schema);
