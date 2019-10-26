import * as httpStatus from "http-status";
import * as mongoose from "mongoose";
import { Observable } from "rxjs";

import { config } from "../config";
import { createHttpError } from "../utils/response";
import { logger } from "./logger";

(mongoose as any).Promise = global.Promise;

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  promiseLibrary: global.Promise,
  reconnectTries: 3,
  reconnectInterval: 300,
  poolSize: 10,
  autoReconnect: true,
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  keepAlive: 1,
} as any;

export const connectMongoDB = () => {
  return Observable.defer(() => {
    if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 4) {
      return Observable
        .fromPromise(mongoose.connect(config.mongoUrl, options))
        .catch((error) => {
          logger.error(`Unable to reconnect to mongodb
            ${JSON.stringify(error)}
          `);

          return Observable.throw(createHttpError("Service unavailable", httpStatus.SERVICE_UNAVAILABLE));
        });
    }

    return Observable.of(true);
  });
};
