import { Schema } from "mongoose";

export class BaseSchema extends Schema {
  constructor (definition, options) {
    super(definition, options);

    this.set("toJSON", {
      transform (_, ret) {
          ret.id = ret._id;
          delete ret._id;
          delete ret.__v;
      },
    });
  }
}
