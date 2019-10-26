import { Document, Model, model, Schema } from "mongoose";
import { DEFAULT_TIMESTAMPS_CONFIG } from "../constants/mongoose";
import { BaseSchema } from "./base/base_schema";
import { Flight } from "./flight";

export interface IFlightSeat {
  flight: any;
  position: {
      row: number,
      column: string,
  };
  section: number;
  seat_type: string;
  occupied_by: string;
}

export interface IFlightSeatModel extends IFlightSeat, Document {}

const schema = new BaseSchema(
  {
    flight: { type: Schema.Types.ObjectId, ref: Flight, required: true },
    position: {
        row: { type: Number, required: true },
        column: { type: String, required: true },
    },
    section: { type: Number, required: true },
    seat_type: { type: String, required: true },
    occupied_by: { type: String },
  },
  {
    timestamps: DEFAULT_TIMESTAMPS_CONFIG,
    versionKey: false,
  },
);

schema.set("toJSON", {
    transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        ret.seat_name = `${ret.position.row}${ret.position.column}`;
        ret.is_occupied = ret.occupied_by !== undefined && ret.occupied_by !== null && ret.occupied_by !== "";
    },
});

export const FlightSeat: Model<IFlightSeatModel> = model<IFlightSeatModel>("FlightSeat", schema);
