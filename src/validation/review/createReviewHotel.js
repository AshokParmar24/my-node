const { body } = require("express-validator");
const HotelReview = require("../../api/review/review.model");

const createHotelReview = [
  body("userId")
    .trim()
    .notEmpty()
    .withMessage("user required Id")
    .bail()
    .custom(async (value, { req }) => {
      if (!req.body.hotelId) {
        throw new Error("Hotel ID is required");
      }

      const existingReview = await HotelReview.findOne({
        userId: value,
        hotelId: req.body.hotelId,
      });

      if (existingReview) {
        throw new Error("You have already reviewed this hotel");
      }
    }),
  body("hotelId").trim().notEmpty().withMessage("Hotel ID is required"),
  body("rating")
    .trim()
    .notEmpty()
    .withMessage("rating is required")
    .bail()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be a number between 1 and 5"),

  body("comment")
    .trim()
    .optional()
    .isLength({ max: 500 })
    .withMessage("Comment can be up to 500 characters long"),
];

module.exports = createHotelReview;
