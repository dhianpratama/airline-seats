import RxRouter from "koa-router-rx";
import { bookSeatsInBulkHandler } from "./handlers/admin/book_seat_bulk_handler";
import { clearSeatByIdHandler } from "./handlers/admin/clear_seat_by_id_handler";
import { createFlightHandler } from "./handlers/admin/create_flight_handler";
import { deleteFlightHandler } from "./handlers/admin/delete_flight_handler";
import { loginAdminHandler } from "./handlers/admin/login_admin_handler";
import { bookSeatHandler } from "./handlers/flight/book_seat_handler";
import { getSeatRequestHandler } from "./handlers/flight/get_seat_request_detail";
import { listFlightHandler } from "./handlers/flight/list_flight_handler";
import { listFlightSeatHandler } from "./handlers/flight/list_flight_seat_handler";
import { livenessHandler } from "./handlers/healthcheck/liveness_handler";
import { indexHandler } from "./handlers/index_handler";

const router = new RxRouter();

router.get("/", indexHandler);
router.get("/liveness", livenessHandler);

// For guest - without Auth
router.get("/flights", listFlightHandler);
router.get("/flights/:flight_id/seats", listFlightSeatHandler);
router.post("/flights/:flight_id/seats/book", bookSeatHandler);
router.get("/flights/seats/requests/:request_id", getSeatRequestHandler);
router.delete("/flights/seats/:flight_seat_id", clearSeatByIdHandler);

// For admin - with Auth
router.post("/admin/login", loginAdminHandler);
router.post("/admin/flights/:flight_id/seats/book/bulk", bookSeatsInBulkHandler);
router.delete("/admin/flights/:flight_id", deleteFlightHandler);
router.post("/admin/flights", createFlightHandler);

export { router };
