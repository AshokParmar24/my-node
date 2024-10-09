const express = require("express");
const createHotelReviewValidation = require("../../validation/review/createReviewHotel");
const validate = require("../../middlewares/validate");
const auth = require("../../middlewares/auth");
const router = express.Router();

const { createHotelReview,hotelWiseReviewList,useReviewList } = require("./review.controller");

router
  .route("/hotel")
  .post(auth, validate(createHotelReviewValidation), createHotelReview);
router.route("/hotel-wise-list").get(auth, hotelWiseReviewList);
router.route("/user").get(auth,useReviewList)

module.exports = router;
