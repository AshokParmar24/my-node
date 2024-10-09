const { body } = require("express-validator");
const Coupon = require("../../api/discountCupon/coupon.model"); // Path to your Coupon model
const moment = require("moment");
const User = require("../../api/user/user.model");
const Hotel = require("../../api/company/company.model");

const validateCoupon = [
  // Validate code
  body("code")
    .notEmpty()
    .withMessage("Coupon code is required")
    .bail()
    .isString()
    .withMessage("Coupon code must be a string")
    .bail()
    .custom(async (value) => {
      const coupon = await Coupon.findOne({ code: value });
      if (coupon) {
        throw new Error("Coupon code already exists");
      }
      return true;
    }),

  // Validate discountPercentage
  body("discountPercentage")
    .notEmpty()
    .withMessage("Discount percentage is required")
    .bail()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount percentage must be between 0 and 100"),

  // Validate validFrom
  body("validFrom")
    .notEmpty()
    .withMessage("Valid from date is required")
    .isISO8601()
    .withMessage("Valid from date must be a valid date")
    .custom((value) => {
      const validFromDate = moment(value, "YYYY-MM-DD", true); // Parse as a strict ISO 8601 date
      const today = moment().startOf("day"); // Get today's date, without time

      // Check if the validFrom date is today or in the future
      if (!validFromDate.isValid()) {
        throw new Error("Invalid date format");
      }

      if (validFromDate.isBefore(today)) {
        throw new Error("Valid from date must be today or a future date");
      }

      return true;
    }),

  // Validate validTo
  body("validTo")
    .notEmpty()
    .withMessage("Valid to date is required")
    .bail()
    .isISO8601()
    .withMessage("Valid to date must be a valid ISO 8601 date")
    .bail()
    .custom((validTo, { req }) => {
      const validFromDate = moment(req.body.validFrom, "YYYY-MM-DD", true); // Parse validFrom
      const validToDate = moment(validTo, "YYYY-MM-DD", true); // Parse validTo

      // Check if validFrom and validTo dates are valid
      if (!validFromDate.isValid()) {
        throw new Error("Invalid validFrom date");
      }
      if (!validToDate.isValid()) {
        throw new Error("Invalid validTo date");
      }

      // Check if validTo date is the same or after validFrom date
      if (!validToDate.isSameOrAfter(validFromDate)) {
        throw new Error(
          "Valid to date must be the same or after the valid from date"
        );
      }

      return true;
    }),

  // Validate hotels array
  body("hotels")
    .isArray({ min: 1 })
    .withMessage("At least one hotel must be selected")
    .bail()
    .custom(async (hotels) => {
      for (let hotelId of hotels) {
        // Query the hotel to check if it exists and is open
        const hotel = await Hotel.findById(hotelId);

        if (!hotel) {
          throw new Error(`Hotel not found: ${hotelId}`);
        }

        if (!hotel.isOpen) {
          throw new Error(`Hotel is not open: ${hotelId}`);
        }
      }
      return true;
    }),

  // Validate userId
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .bail()
    .custom(async (value) => {
      const exist = await User.findOne({ _id: value, isActive: true });
      if (!exist) {
        throw new Error(`User with ID ${value} not found or inactive`);
      }
      return true; // Returning true to signify successful validation
    }),
];

module.exports = validateCoupon;
