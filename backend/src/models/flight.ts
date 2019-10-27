import { Document, Model, model, Schema } from "mongoose";
import { DEFAULT_TIMESTAMPS_CONFIG } from "../constants/mongoose";
import { BaseSchema } from "./base/base_schema";

export interface IFlight {
    flight_number: string;
    seat_map: [number[]];
}

export interface IFlightModel extends IFlight, Document {}

const schema = new BaseSchema(
  {
    flight_number: { type: String, required: true },
    seat_map: [{ type: Schema.Types.Mixed }],
  },
  {
    timestamps: DEFAULT_TIMESTAMPS_CONFIG,
    versionKey: false,
  },
);

export const Flight: Model<IFlightModel> = model<IFlightModel>("Flight", schema);
