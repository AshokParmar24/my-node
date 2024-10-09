const { body } = require("express-validator");
const Companys = require("../../api/company/company.model");
const Rooms = require("../../api/room/room.modal");

const roomCreateValidation = [
  body("roomNumber")
    .notEmpty()
    .withMessage("Room number is required")
    .bail()
    .isString()
    .withMessage("Invalid room number")
    .custom(async (value, { req }) => {
      const existRoom = await Rooms.findOne({
        roomNumber: value,
        owner: req.body.owner,
        hotel: req.body.hotel,
      });
      if (existRoom) {
        throw new Error("You have already create room");
      }
    }),
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Room type is required")
    .bail()
    .isIn(["Single", "Double", "Suite"])
    .withMessage("Room type must be either Single, Double, or Suite"),
  body("price")
    .trim()
    .notEmpty()
    .withMessage("Price is required")
    .bail()
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((value) => value > 0)
    .withMessage("Price must be greater than zero"),
  body("isAvailable")
    .isBoolean()
    .withMessage("Availability status must be a boolean"),
  ,
  body("owner")
    .trim()
    .notEmpty()
    .withMessage("Owner is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid owner ")
    .bail()
    .custom(async (value) => {
      const existingHotel = await Companys.findOne({
        userId: value,
        isOpen: true,
      });
      if (!existingHotel) {
        return Promise.reject("This owner not any hotel");
      }
    }),
  body("hotel")
    .trim()
    .notEmpty()
    .withMessage("Hotel is required")
    .isMongoId()
    .withMessage("Invalid hotel")
    .bail()
    .custom(async (value) => {
      const existingHotel = await Companys.findOne({
        _id: value,
        isOpen: true,
      });
      if (!existingHotel) {
        return Promise.reject("Hotel does not exist or is not open");
      }
    }),
  body("description")
    .trim()
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("amenities")
    .optional()
    .isArray()
    .withMessage("Amenities must be an array of strings")
    .custom((value) => {
      if (value.some((item) => typeof item !== "string")) {
        throw new Error("All amenities must be strings");
      }
      return true;
    }),
  body("maxOccupancy")
    .trim()
    .notEmpty()
    .withMessage("Max occupancy is required")
    .isInt({ min: 1 })
    .withMessage("Max occupancy must be at least 1"),
  body("checkInTime")
    .optional()
    .isString()
    .matches(/^([01]\d|2[0-3]):([0-5]\d) (AM|PM)$/)
    .withMessage('Check-in time must be in "h:mm A" format'),
  body("checkOutTime")
    .optional()
    .isString()
    .matches(/^([01]\d|2[0-3]):([0-5]\d) (AM|PM)$/)
    .withMessage('Check-out time must be in "h:mm A" format'),

  body("bedCount")
    .notEmpty()
    .withMessage("Bed count is required")
    .isInt({ min: 1 })
    .withMessage("Bed count must be at least 1"),

  body("hasAC")
    .optional()
    .isBoolean()
    .withMessage("AC availability must be a boolean value"),
  body("isBooking")
    .optional()
    .isBoolean()
    .withMessage("isBooking availability must be a boolean value"),
];

module.exports = roomCreateValidation;
