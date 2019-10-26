import RxRouter from "koa-router-rx";
import { createFlightHandler } from "./handlers/flight/create_flight_handler";
import { listFlightHandler } from "./handlers/flight/list_flight_handler";
import { livenessHandler } from "./handlers/healthcheck/liveness_handler";

const router = new RxRouter();

router.get("/liveness", livenessHandler);

router.get("/flights", listFlightHandler);
router.post("/flights", createFlightHandler);

export { router };
