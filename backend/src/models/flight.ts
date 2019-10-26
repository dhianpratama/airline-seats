import { Document, Model, model, Schema } from "mongoose";
import { DEFAULT_TIMESTAMPS_CONFIG } from "../constants/mongoose";
import { BaseSchema } from "./base/base_schema";

export interface IFlight {
  name: string;
  input_data: [number[]];
}

export interface IFlightModel extends IFlight, Document {}

const schema = new BaseSchema(
  {
    name: { type: String, required: true },
    input_data: [{ type: Schema.Types.Mixed }],
  },
  {
    timestamps: DEFAULT_TIMESTAMPS_CONFIG,
    versionKey: false,
  },
);

export const Flight: Model<IFlightModel> = model<IFlightModel>("Flight", schema);
