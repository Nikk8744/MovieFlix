import { Router } from "express";
import { deleteBooking, getAllBookingsForMovie, getAllBookingsForUser, getBookingById, newBooking } from "../controllers/booking.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route("/:movieId").post(newBooking)

router.route("/:bookingId").get(getBookingById)

router.route("/:bookingId").delete(deleteBooking)

router.route("/user/:userId").get(getAllBookingsForUser)

router.route("/admin/:movieId").get(isAdmin, getAllBookingsForMovie)

export default router;

