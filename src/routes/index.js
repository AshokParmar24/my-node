const express = require("express");
const userRoute = require("../api/user/user.router");
const companyRoute = require("../api/company/company.router");
const roomRoute = require("../api/room/room.router");
const bookingRoute = require("../api/booking/booking.router");
const reviewRoute = require("../api/review/review.router");
const stripeRoute = require("../api/stripe/stripe.router");
const couponRoute = require("../api/discountCupon/coupon.router");

const router = express?.Router();

router.use("/user", userRoute);
router.use("/company", companyRoute);
router.use("/room", roomRoute);
router.use("/booking", bookingRoute);
router.use("/review", reviewRoute);
router.use("/stripe", stripeRoute);
router.use("/coupon", couponRoute);

module.exports = router;
