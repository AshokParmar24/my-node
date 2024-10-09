const express = require("express");

const router = express?.Router();
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const bookingCreateValidation = require("../../validation/booking/bookingCreate");
const { createBooking, userWiseBookings } = require("./booking.controller");

router
  .route("/create")
  .post(auth, validate(bookingCreateValidation), createBooking);
router.route("/user-wise").get(auth, userWiseBookings);

module.exports = router;
