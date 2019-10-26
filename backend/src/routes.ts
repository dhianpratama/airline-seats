import RxRouter from "koa-router-rx";
import { bookSeatsInBulkHandler } from "./handlers/flight/book_seat_bulk_handler";
import { bookSeatHandler } from "./handlers/flight/book_seat_handler";
import { createFlightHandler } from "./handlers/flight/create_flight_handler";
import { listFlightHandler } from "./handlers/flight/list_flight_handler";
import { listFlightSeatHandler } from "./handlers/flight/list_flight_seat_handler";
import { livenessHandler } from "./handlers/healthcheck/liveness_handler";

const router = new RxRouter();

router.get("/liveness", livenessHandler);

router.get("/flights", listFlightHandler);
router.post("/flights", createFlightHandler);
router.get("/flights/:flight_id/seats", listFlightSeatHandler);
router.post("/flights/:flight_id/seats/book", bookSeatHandler);
router.post("/flights/:flight_id/seats/book/bulk", bookSeatsInBulkHandler);

export { router };
