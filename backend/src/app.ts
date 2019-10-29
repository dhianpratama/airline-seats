import * as cors from "@koa/cors";
import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import * as helmet from "koa-helmet";
import * as koaLogger from "koa-logger";

import { config } from "./config";
import { router } from "./routes";
import queueService from "./services/queue_service";
import workerService from "./services/worker_service";
import { logger } from "./utils/logger";

class App {
    constructor () {
        console.log("CONFIG => ", config);
        this.createHttpServer();
        this.startRsmqWorker();
    }

    private createHttpServer = (): void => {
        // Koa Http Server
        const app = new Koa();
        app.use(helmet());
        app.use(cors());
        app.use(koaLogger());
        app.use(bodyParser());
        app.use(router.routes()).use(router.allowedMethods());
        app.listen(config.port, () => logger.info(`Server running on port ${config.port}`));
    }

    private startRsmqWorker = (): void => {
        workerService.startConsuming();
    }
}

export default new App();
