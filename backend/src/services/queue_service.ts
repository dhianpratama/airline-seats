import * as RSMQPromise from "rsmq-promise";
import { Observable } from "rxjs";
import { config } from "../config";
import { SeatRequestQueueName } from "../constants/queue";

class QueueService {
    public ensureQueueConnection = (): Observable<RSMQPromise> => {
        const rsmq = new RSMQPromise({ host: config.redisHost, port: config.redisPort });
        return Observable.fromPromise(rsmq.createQueue({ qname: SeatRequestQueueName }))
            .catch((error: Error) => {
                console.error(error.message);
                return Observable.of({});
            })
            .switchMap(() => Observable.of(rsmq));
    }

    public publishToQueue = (message: object | string) => {
        const messageInString = typeof message === "object"
            ? JSON.stringify(message)
            : message;
        return this.ensureQueueConnection()
            .switchMap((rsmq) => Observable.fromPromise(rsmq.sendMessage({ qname: SeatRequestQueueName, message: messageInString })));
    }
}

export default new QueueService();
