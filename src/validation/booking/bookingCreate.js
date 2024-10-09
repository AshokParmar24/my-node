const { body } = require("express-validator");
const moment = require("moment");
const Users = require("../../api/user/user.model");
const Rooms = require("../../api/room/room.modal");

const bookingCreateValidation = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid User ID")
    .custom(async (value) => {
      const existUser = await Users.findOne({ _id: value, isActive: true });
      if (!existUser) {
        return Promise.reject("This user not register");
      }
    }),
  body("roomId")
    .notEmpty()
    .withMessage("Room ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid Room ID")
    .custom(async (value) => {
      const existRooms = await Rooms.findOne({
        _id: value,
        isAvailable: true,
        isBooking: false,
      });
      if (!existRooms) {
        return Promise.reject("At the time room not available");
      }
    }),
  body("checkIn")
    .notEmpty()
    .withMessage("Check-in date is required")
    .bail()
    .custom((value) => {
      const isValidDate = moment(value, moment.ISO_8601, true).isValid();
      if (!isValidDate) {
        throw new Error("Invalid date format");
      }
      if (moment(value).isSameOrBefore(moment())) {
        throw new Error("Check-in date must be in the future");
      }
      return true;
    }),
  body("checkOut")
    .notEmpty()
    .withMessage("Check-out date is required")
    .bail()
    .custom((value, { req }) => {
      const isValidDate = moment(value, moment.ISO_8601, true).isValid();
      if (!isValidDate) {
        throw new Error("Invalid date format");
      }
      if (moment(value).isSameOrBefore(moment(req.body.checkIn))) {
        throw new Error("Check-out date must be after check-in date");
      }
      return true;
    }),
  body("discountCoupon")
    .optional()
    .isString()
    .withMessage("Discount coupon must be a string"),
  body("discountPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount price must be a non-negative number"),
  body("totalPrice")
    .notEmpty()
    .withMessage("Total price is required")
    .bail()
    .isFloat({ min: 0 })
    .withMessage("Total price must be a non-negative number"),
];

module.exports = bookingCreateValidation;
