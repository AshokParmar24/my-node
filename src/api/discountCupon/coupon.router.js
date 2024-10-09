const express = require("express");
const auth = require("../../middlewares/auth");
const couponCreateValidation = require("../../validation/coupon/couponCreateValidation");
const validate = require("../../middlewares/validate");
const router = express.Router();

const {
  createCouponCode,
  hotelUserWiseCoupun,
  getHotelWiseCoupon,
} = require("../discountCupon/cupon.controller");

router
  .route("/create")
  .post(auth, validate(couponCreateValidation), createCouponCode);

router.route("/hotel-user-wise").get(auth, hotelUserWiseCoupun);

router.route("/:id").get(auth, getHotelWiseCoupon);

module.exports = router;
